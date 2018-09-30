<template>
  <div>
    <template v-if="isLoggedIn">
      <popup-modal v-if="user.firstTimeInChat" @close="updateUser()">
        <p slot="header" class="teal-text center">
          Discuss questions with the chat and a realtime whiteboard.
          Pressing the "share" icon will record the drawings and the chat history into a "discussion" that can be viewed by 
          all other study groups.
        </p>
      </popup-modal>
    </template>
    <popup-modal v-if="isSharingJourney" @close="shareJourney()">
      <input slot="header" v-model="newJourneyTitle" placeholder="Give a title to this discussion" class="teal-text center">
    </popup-modal>
    <h3 v-if="chatroom.title" class="center">{{ chatroom.title }}</h3>
    <base-button @click="updateParticipants()">Join group</base-button>
    <base-button @click="leaveGroup()">Leave group</base-button>
    <!-- <template v-if="journeys">
      <div class="collection-list-wrapper">
        <collection-list title="Users with this chat open somewhere" :listItems="usersViewingPage">
          <template slot-scope="{ item }">
            {{ item.displayName }}
          </template>
        </collection-list>
      </div>
    </template> -->
    <template v-if="chatroom">
      <div style="margin: auto; width: 40%;">
        <collection-list title="Group Chat Members" :listItems="usersAvalibility">
          <template slot-scope="{ item }">
            {{ item.displayName }}
            <i v-if="item.isOnline" class="material-icons user-online secondary-content">fiber_manual_record</i>
          </template>
        </collection-list>
      </div>
    </template>
    <p v-if="feedback" class="yellow-text center">{{ feedback }}</p>
    <div class="center" style="margin-top: 25px;">
      <pulse-button iconName="share" @click="isSharingJourney = true" tooltipText="Save the discussion, reset the board and the chat messages"/>
    </div>
    <div style="width: 90%; margin: auto;">
      <base-button @click="resetBoard()">Reset whiteboard</base-button>
      <whiteboard ref="whiteboard"/>
    </div>
    <div class="flexbox-container">
      <div class="chat-wrapper">
        <h4 class="center">Chat</h4>
        <base-button @click="resetMessages()">Reset chat</base-button>
        <div class="card">
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
    </div>
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
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
import moment from 'moment'
import ChatNewMessage from '@/components/chat/ChatNewMessage.vue'
import Whiteboard from '@/components/chat/Whiteboard.vue'
import PulseButton from '@/components/reusables/PulseButton.vue'
import CollectionList from '@/components/reusables/CollectionList.vue'
import PopupModal from '@/components/reusables/PopupModal.vue'
import db from '@/firebase/init.js'
import { constants } from 'zlib';

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
      isSharingJourney: false,
      chatroom: {},
      whiteboard: {},
      journeys: [],
      newJourneyTitle: '', 
      feedback: '',
      usersViewingPage: []
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    membersWithOnlineStatus () {
      if (!this.usersViewingPage) {
        return 
      }
      if (!this.chatroom.participants) {
        return 
      }
      const onlineUIDs = this.usersViewingPage.map(obj => obj.uid)
      let output = this.chatroom.participants.map(person => {
        const personCopy = {
          displayName: person.displayName,
          isOnline: onlineUIDs.includes(person.uid)
        }
        return personCopy
      })
      return output 
    },
    hasFetchedUser () {
      return this.$store.state.hasFetchedUser 
    },
    isLoggedIn () {
      return this.user != null && this.user != 'undetermined'
    },
    usersAvalibility() {
      const activeUIDs = this.usersViewingPage.reduce((prev,obj) => {
        prev[obj.uid] = true;
        return prev
      }, {})
      return this.chatroom.participants.map(user => {
        return {
          displayName: user.displayName, 
          isOnline: activeUIDs[user.uid] ? true : false
        } 
      })
    }
  },
  watch: {
    user: {
      handler: 'handleMembershipLogic',
      immediate: true 
    },
    chatroom () {
      if (this.chatRoom != {}) {
        this.fetchJourneys()
      }
    }
  },
  async created () {
    // display users viewing the page 
    const roomID = this.$route.params.room_id
    const queryRef = db.collection('users')
                         .where('isOnline', '==', true)


    await this.$bind('usersViewingPage', queryRef)
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
  async destroyed () {
    const ref = db.collection('users').doc(this.user.uid)
    await ref.update({
      isTalking: false 
    })
  },
  methods: {
    showGreenDot (isOnline) {
      return isOnline ? 'fiber_manual_record' : null 
    },
    async resetMessages () {
      const roomID = this.$route.params.room_id
      const ref = db.collection('chatrooms').doc(roomID)
      await ref.update({
        messages: [],
      })
    },
    resetBoard () {
      this.$refs.whiteboard.resetBoard()
    },
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
      const roomID = this.$route.params.room_id
      const userRef = db.collection('users').doc(this.user.uid)
      await userRef.update({
        isTalking: true,
        recentChatID: roomID
      })
    },
    handleMembershipLogic () {
      if (this.hasFetchedUser && this.user != null) {
        this.addToRecentChat() 
      }
    },
    async updateParticipants () {
      const roomID = this.$route.params.room_id 
      const ref = db.collection('chatrooms').doc(roomID)
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid 
      }
      await ref.update({
        participants: firebase.firestore.FieldValue.arrayUnion(simplifiedUser)
      })
      // add reference to the group chat
      const userRef = db.collection('users').doc(this.user.uid)
      await userRef.update({
        chatrooms: firebase.firestore.FieldValue.arrayUnion(roomID),
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
    },
    async leaveGroup () {
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid
      }
      const roomID = this.$route.params.room_id
      const ref = db.collection('chatrooms').doc(roomID)
      await ref.update({
        participants: firebase.firestore.FieldValue.arrayRemove(simplifiedUser)
      })
      // remove reference from the user's perspective
      const userRef = db.collection('users').doc(this.user.uid)
      await userRef.update({
        chatrooms: firebase.firestore.FieldValue.arrayRemove(roomID)
      })
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

.user-online {
  font-size: 10px; 
  color: #4aba34;
}
</style>
