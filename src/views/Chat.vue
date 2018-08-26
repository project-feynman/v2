<template>
  <div>
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
    <whiteboard></whiteboard>
    <base-button @click="saveConversation()">Save conversation</base-button>
  </div>
</template>

<script>
import moment from 'moment'
import ChatNewMessage from '@/components/chat/ChatNewMessage.vue'
import Whiteboard from '@/components/chat/Whiteboard.vue'
import db from '@/firebase/init.js'

export default {
  components: {
    ChatNewMessage,
    Whiteboard
  },
  data () {
    return {
      messages: [],
      whiteboard: {},
      participants: []
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  watch: {
    // don't want to execute this more than twice
    user () {
      if (this.user != null && this.user != 'undetermined') {
        this.addToRecentChat()
      }
    }
  },
  async created () {
    if (this.user != null && this.user != 'undetermined') {
      this.addToRecentChat()
    }
    let roomID = this.$route.params.room_id
    let doc = db.collection('chatRooms').doc(roomID)
    let chatRoom = await doc.get()
    if (!chatRoom.data()) {
      await doc.set({
        messages: [],
      })
      const whiteboardRef = db.collection('whiteboards').doc(roomID)
      await whiteboardRef.set({
        allPaths: []
      })
    }
    // fetch messages from Firestore and set up syncing 
    doc.onSnapshot(snapshot => {
      if (snapshot.exists) {
        this.messages = snapshot.data().messages
        this.participants = snapshot.data().participants
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
    },
    async saveConversation () {
      // save doodle and messages
      const conversation = {
        doodle: this.whiteboard.allPaths,
        messages: this.messages,
        participants: this.participants 
      }
      const ref = db.collection('conversations')
      const conversationID = await ref.add(conversation)
      // get rid of the first 15 characters i.e. /conversations/
      conversationID = conversationID.slice(15)
      console.log('conversationID =', conversationID)
      // save conversation for both users 
      this.participants.forEach(async person => {
        const docRef = db.collection('users').doc(person.uid)
        const doc = await docRef.get()
        console.log(`user doc = ${doc}`)
        const convos = doc.conversations 
        const updateObj = {} 
        if (!convos) {
          updateObj.conversations = [conversationID] 
          await docRef.update(updateObj)
        } else {
          convos.push(conversationID)
          updateObj.conversations = convos
          await docRef.update(updateObj)
        }
      })
    }
  }
}
</script>

<style scoped>
span {
  font-size: 1.4em;
}

.time {
  display: block;
  font-size: 0.8em;
}

.messages {
  max-height: 300px;
  overflow: auto;
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
