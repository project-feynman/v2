<template>
  <div>
    <h2 contenteditable 
        @keydown="updateTitle($event)" 
        @keydown.enter.prevent="doNothing()">
      {{ title }}
    </h2>
    <div class="center">
      <pulse-button iconName="share" @click="shareJourney()"/>
    </div>
    <p v-if="participants" class="center">Participants: {{ participants }}</p>
    <p v-if="feedback" class="yellow-text center">{{ feedback }}</p>
    <div class="flexbox-container">
      <div class="chat-wrapper">
        <div class="card">
          <div class="card-content">
            <ul class="messages" v-chat-scroll>
              <li v-for="message in messages" :key="message.id">
                <span class="teal-text">{{ message.author.displayName }}: </span>
                <span class="grey-text text-darken-3">{{ message.content }}</span>
                <span class="grey-text time">{{ prettifyDate(message.timestamp) }}</span>
              </li>
            </ul>
          </div>
          <div class="card-action">
            <chat-new-message/>
          </div>
        </div>
      </div>
      <div class="whiteboard-wrapper">
        <whiteboard/>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import firebase from 'firebase/app'
import 'firebase/firestore'
import ChatNewMessage from '@/components/chat/ChatNewMessage.vue'
import Whiteboard from '@/components/chat/Whiteboard.vue'
import PulseButton from '@/components/reusables/PulseButton.vue'
import db from '@/firebase/init.js'


export default {
  components: {
    ChatNewMessage,
    Whiteboard,
    PulseButton
  },
  data () {
    return {
      title: '',
      messages: [],
      whiteboard: {},
      participants: [],
      forQuestion: '',
      feedback: ''
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    isLoggedIn () {
      return this.user != null && this.user != 'undetermined'
    }
  },
  watch: {
    // don't want to execute this more than twice
    user () {
      if (this.isLoggedIn) {
        this.addToRecentChat()
      }
    }
  },
  async created () {
    if (this.isLoggedIn) {
      this.addToRecentChat() // this does more than just addToRecentChat()
    }
    let roomID = this.$route.params.room_id
    let doc = db.collection('chatRooms').doc(roomID)
    let chatRoom = await doc.get()
    if (!chatRoom.data()) {
      this.feedback = 'This is not a chatroom - to create a chatroom, message a classmate on a particular question'
    }
    // fetch messages from Firestore and set up syncing 
    doc.onSnapshot(snapshot => {
      if (snapshot.exists) {
        const data = snapshot.data()
        this.title = data.title 
        this.messages = data.messages
        this.participants = data.participants
        this.forQuestion = data.forQuestion 
      }
    })
    // fetch drawing from Firestore and set up syncing 
    const whiteboardDoc = db.collection('whiteboards').doc(roomID)
    whiteboardDoc.onSnapshot(snapshot => {
      if (snapshot.exists) {
        this.whiteboard = snapshot.data()
      }
    })
  },
  methods: {
    prettifyDate (timestamp) {
      return moment(timestamp).format("lll")
    },
    async addToRecentChat () {
      const userRef = db.collection('users').doc(this.user.uid)
      await userRef.update({
        recentChatID: this.$route.params.room_id
      })
      // we set isTalking to false when the user visits the Question page again 
      await userRef.update({
        isTalking: true 
      })
    },
    async shareJourney () {
      this.feedback = 'Saving the doodle as an animation...'
      // upload the journey to Firestore 
      const conversation = {
        doodle: this.whiteboard.allPaths,
        messages: this.messages,
        participants: this.participants,
        title: this.title 
      }
      const convoRef = db.collection('conversations')
      var conversationID = await convoRef.add(conversation)
      conversationID = conversationID.id
      // associate the journey with the question
      const query = db.collection('questions').where('questionID', '==', this.forQuestion)
      const results = await query.get() 
      if (results) {
        const doc = results.docs[0]
        const convoObj = {
          title: this.title,
          participants: this.participants,
          conversationID
        }
        const ref = db.collection('questions').doc(doc.id) 
        await ref.update({
          journeys: firebase.firestore.FieldValue.arrayUnion(convoObj)
        })
      }
      // associate journey with the participants themselves
      await this.saveConversation(conversationID)
      this.$router.push(this.forQuestion)
    },
    async saveConversation (conversationID) {
      this.participants.forEach(async person => {
        const docRef = db.collection('users').doc(person.uid)
        const convoObj = {
          conversationID,
          title: 'default title' 
        }
        await docRef.update({
          conversations: firebase.firestore.FieldValue.arrayUnion(convoObj)
        })
      })
    },
    async updateTitle (event) {
      if (event.key == 'Enter') {
        this.feedback = 'Saving title...'
        document.activeElement.blur()
        this.title = event.target.innerText
        // update title for the chatRoom
        const roomID = this.$route.params.room_id
        const docRef = db.collection('chatRooms').doc(roomID)
        await docRef.update({
          title: this.title 
        })
        this.feedback = ''
      }
    },
    doNothing () {
      return 
    }
  }
}
</script>

<style lang="scss" scoped>
h2 {
  @extend .center;
}

.button-wrapper {
  margin: auto;
}

span {
  font-size: 1.4em;
}

.time {
  display: block;
  font-size: 0.8em;
}

.whiteboard-wrapper {
  width: 50%;
  min-height: 1000px;
}

.chat-wrapper {
  width: 50%;
}

.messages {
  max-height: 300px;
  overflow: auto;
}

.flexbox-container {
  display: flex;
}

.messages::-webkit-scrollbar {
  width: 3px;
}

.messages::-webkit-scrollbar-track {
  background: #ddd;
}

.messages::-webkit-scrollbar-thumb {
  background: #aaa;
}
</style>
