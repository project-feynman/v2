<template>
  <div>
    <template v-if="isLoggedIn">
      <popup-modal v-if="user.firstTimeInChat" @close="updateUser()">
        <p slot="header" class="teal-text center">
          Discuss questions with the chat and a realtime whiteboard.
          For harder questions, meet up in real life. 
          Pressing the "share" icon will record the drawings and the chat history into a "discussion" that can be viewed by 
          all other study groups.
        </p>
      </popup-modal>
    </template>
    <popup-modal v-if="isSharingJourney" @close="shareJourney()">
      <input slot="header" v-model="newJourneyTitle" placeholder="Give a title to this discussion" class="teal-text center">
    </popup-modal>
    <h3 v-if="chatroom.title" class="center">{{ chatroom.title }}</h3>
    <div class="flexbox-container">
      <template v-if="journeys">
        <div class="collection-list-wrapper">
          <collection-list title="Recorded discussions"
                      :listItems="journeys"
                      actionIcon="delete"
                      @item-click="journey => processDeleteAttempt(journey)"
                      @entire-click="journey => redirect(journey)">
            <template slot-scope="{ item }">
              {{ item.title }}
            </template>
          </collection-list>
        </div>
      </template>
    </div>
    <p v-if="feedback" class="yellow-text center">{{ feedback }}</p>
    <div class="center" style="margin-top: 25px;">
      <pulse-button iconName="share" @click="isSharingJourney = true" tooltipText="Save the discussion, reset the board and the chat messages"/>
    </div>
    <div class="flexbox-container">
      <div class="chat-wrapper">
        <h4 class="center">Chatroom</h4>
        <div class="card">
          <!-- <div class="card-title">
            <p v-if="chatroom.participants" class="black-text center">Participants: {{ chatroom.participants }}</p>
          </div> -->
          <div class="card-content">
            <ul class="messages" v-chat-scroll>
              <li v-for="message in chatroom.messages" :key="message.id">
                <span class="teal-text">{{ message.author.displayName }}: </span>
                <span class="grey-text text-darken-3">{{ message.content }}</span>
                <span class="grey-text time">{{ prettifyDate(message.timestamp) }}</span>
              </li>
            </ul>
          </div>
          <div class="card-action">
            <chat-new-message :participants="chatroom.participants"/>
          </div>
        </div>
      </div>
      <div class="whiteboard-wrapper">
        <h4 class="center">Whiteboard</h4>
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
import CollectionList from '@/components/reusables/CollectionList.vue'
import PopupModal from '@/components/reusables/PopupModal.vue'
import db from '@/firebase/init.js'

export default {
  components: {
    ChatNewMessage,
    Whiteboard,
    PulseButton,
    CollectionList,
    PopupModal 
  },
  data () {
    return {
      hasFetchedJourneys: false, 
      chatroom: {},
      whiteboard: {},
      journeys: [],
      newJourneyTitle: '', 
      feedback: '',
      isSharingJourney: false
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
    },
    chatroom () {
      if (this.chatRoom != {}) {
        this.fetchJourneys()
      }
    },
    participants () {
      console.log('participants changed')
      // display online users among the participants
      // don't get annoying notifications
    }
  },
  async created () {
    if (this.isLoggedIn) {
      this.addToRecentChat() // this does more than just addToRecentChat()
    }
    let roomID = this.$route.params.room_id
    let doc = db.collection('chatrooms').doc(roomID)
    let chatRoom = await doc.get()
    if (!chatRoom.data()) {
      this.feedback = 'This is not a chatroom - to create a chatroom, message a classmate on a particular question'
    }
    // fetch messages from Firestore and set up syncing 
    await doc.onSnapshot(snapshot => {
      if (snapshot.exists) {
        const data = snapshot.data()
        this.chatroom = data
        this.participants = data.participants
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
    async updateUser () {
      const ref = db.collection('users').doc(this.user.uid)
      await ref.update({
        firstTimeInChat: false 
      })
    },
    async fetchJourneys () {
      // fetch journeys
      const psetID = this.chatroom.forSubject + '/' + this.chatroom.psetNumber 
      const journeyRef = db.collection('conversations').where('psetID', '==', psetID)
      await this.$bind('journeys', journeyRef)
    },
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
    redirect ({ id }) {
      const url = '/conversation/' + id
      this.$router.push(url)
    },
    async shareJourney () {
      this.isSharingJourney = false 
      this.feedback = 'Saving the doodle as an animation...'
      const psetID = this.chatroom.forSubject + '/' + this.chatroom.psetNumber
      // upload the journey to Firestore 
      const conversation = {
        doodle: this.whiteboard.allPaths,
        messages: this.chatroom.messages,
        participants: this.chatroom.participants,
        title: this.newJourneyTitle,
        psetID
      }
      const convoRef = db.collection('conversations')
      await convoRef.add(conversation)
      // reset the messages and the boards afterwards 
      this.feedback = 'Resetting messages'
      const roomID = this.$route.params.room_id
      const chatroomRef = db.collection('chatrooms').doc(roomID)
      await chatroomRef.update({
        messages: [],
        title: "Change the title..."
      })
      this.feedback = 'Resetting whiteboard...'
      const whiteboardRef = db.collection('whiteboards').doc(roomID)
      await whiteboardRef.update({
        allPaths: [] 
      })
      this.feedback = 'Success'
      setTimeout(() => this.feedback = '', 1000)
    },
    async updateTitle (event) {
      if (event.key == 'Enter') {
        this.feedback = 'Saving title...'
        document.activeElement.blur()
        this.title = event.target.innerText
        // update title for the chatRoom
        const roomID = this.$route.params.room_id
        const docRef = db.collection('chatrooms').doc(roomID)
        await docRef.update({
          title: this.title 
        })
        this.feedback = ''
      }
    },
    async processDeleteAttempt (journey) {
      const ref = db.collection('conversations').doc(journey.id) 
      await ref.delete()
    }
  }
}
</script>

<style lang="scss" scoped>
.collection-list-wrapper {
  margin: auto;
  width: 40%;
}

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
  height: 484px;
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
