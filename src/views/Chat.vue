<template>
  <div>
    <template v-if="isLoggedIn">
      <popup-modal v-if="showPopup" @close="showPopup = false">
        <p slot="header" class="teal-text center">
          Here, you can discuss p-set questions with the chat and realtime whiteboard.
          After a discussion, you can share it so others can view it even when you're all gone.
          For hard issues, arrange to meet up in person or visit Office Hours collectively.
        </p>
      </popup-modal>
    </template>
    <div class="center">
      <pulse-button @click="showPopup = true" iconName="warning" tooltipText="Help guide"></pulse-button>
    </div>
     <h2 v-if="description"
        contenteditable 
        @keydown="updateDescription($event)" 
        @keydown.enter.prevent="doNothing()"
        class="center">
      {{ description }}
    </h2>
    <p class="center yellow-text">Remember to press ENTER after editting the description</p>
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
    <p v-if="participants" class="center">Participants: {{ participants }}</p>
    <h2 v-if="title"
        contenteditable 
        @keydown="updateTitle($event)" 
        @keydown.enter.prevent="doNothing()">
      {{ title }}
    </h2>
    <p class="center yellow-text">Remember to press ENTER after editting the topic</p>
    <div class="center">
      <pulse-button iconName="share" @click="shareJourney()" tooltipText="Save the discussion, reset the board and the chat messages"/>
    </div>
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
            <chat-new-message :participants="participants"/>
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
      title: '',
      messages: [],
      whiteboard: {},
      participants: [],
      forSubject: '', 
      journeys: [],
      description: '',
      psetNumber: '',
      feedback: '',
      showPopup: false 
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
    psetNumber () {
      if (this.psetNumber && this.forSubject && !this.hasFetchedJourneys) {
        this.fetchJourneys() 
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
    await doc.onSnapshot(snapshot => {
      if (snapshot.exists) {
        const data = snapshot.data()
        this.title = data.title 
        this.messages = data.messages
        this.participants = data.participants
        this.psetNumber = data.psetNumber 
        this.forSubject = data.forSubject
        this.description = data.description 
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
    async fetchJourneys () {
      // fetch journeys
      const questionID = this.forSubject + '/' + this.psetNumber 
      const journeyRef = db.collection('conversations').where('questionID', '==', questionID)
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
      this.feedback = 'Saving the doodle as an animation...'
      const questionID = this.forSubject + '/' + this.psetNumber
      // upload the journey to Firestore 
      const conversation = {
        doodle: this.whiteboard.allPaths,
        messages: this.messages,
        participants: this.participants,
        title: this.title,
        questionID
      }
      const convoRef = db.collection('conversations')
      await convoRef.add(conversation)
      // reset the messages and the boards afterwards 
      this.feedback = 'Resetting messages'
      const roomID = this.$route.params.room_id
      const chatroomRef = db.collection('chatRooms').doc(roomID)
      await chatroomRef.update({
        messages: [],
        title: "ceci n'est pas une penis"
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
        const docRef = db.collection('chatRooms').doc(roomID)
        await docRef.update({
          title: this.title 
        })
        this.feedback = ''
      }
    },
    async updateDescription (event) {
      if (event.key == 'Enter') {
        this.feedback = 'Saving description...'
        document.activeElement.blur()
        this.description = event.target.innerText
        // update title for the chatRoom
        const roomID = this.$route.params.room_id
        const docRef = db.collection('chatRooms').doc(roomID)
        await docRef.update({
          description: this.description
        })
        this.feedback = ''
      }
    },
    doNothing () {
      return 
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
  width: 60%;
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
