<template>
  <div>
    <!-- Debugging prints for iPad (with no console inspector -->
    <template v-if="isDebugging">
      <h2># of paths = {{ PRINT.doodle.length }}</h2>
    </template>

    <!-- Tutorial popup -->
    <template v-if="isLoggedIn">
      <popup-modal v-if="user.firstTimeInChat" @close="updateUser()">
        <p slot="header" class="teal-text center">
          Discuss questions with the chat and a realtime whiteboard.
          Pressing the "share" icon will record the drawings and the chat history into a "discussion" that can be viewed by 
          all other study groups.
        </p>
      </popup-modal>
    </template>

    <!-- Popup for saving Journey -->
    <popup-modal v-show="isSharingJourney" @close="shareJourney()" @dismiss="shareDismiss()">
      <input slot="header" v-model="newJourneyTitle" placeholder="Give a title to this discussion" ref="journey" id="journey-input" class="teal-text center">
    </popup-modal>
    
    <h3 class="white-text" v-if="!chatroom.title" >Fetching Content...</h3>
    <h3 v-if="chatroom.title" class="center">{{ chatroom.title }}</h3>
    <div class="row" style="margin-top: 50px;">
      <template v-if="chatroom">
        <div class="col s10 m2">
          <collection-list title="Members" :listItems="usersAvalibility">
            <template slot-scope="{ item }">
              {{ item.displayName }}
              <i v-if="item.isOnline" class="material-icons user-online secondary-content">fiber_manual_record</i>
            </template>
          </collection-list>
          <base-button @click="updateParticipants()">
            Join
          </base-button>
          <base-button @click="leaveGroup()">
            Leave
          </base-button>
        </div>
      </template>
    <div class="col s10 m7 offset">
      <div class="chat-wrapper">
        <div class="card">
          <div class="card-content">
            <ul class="messages" v-chat-scroll>
              <li v-for="message in chatroom.messages" :key="message.id">
                <span class="teal-text">{{ message.author.displayName }}: </span>
                <span class="grey-text text-darken-3">{{ message.content }}</span>
                <span class="grey-text time">{{ prettifyDate(message.timestamp) }}</span>
              </li>
            </ul>
            <span class="grey-text time">
              {{ typingIndicator }}
            </span>
          </div>
          <div class="card-action">
            <chat-new-message @onInputChange="newChatMessageChange" :participants="chatroom.participants"/>
          </div>
        </div>
      </div>
      <base-button @click="resetMessages()">Reset chat</base-button>
    </div>
    <template v-if="journeys">
        <div class="col s10 m3">
        <collection-list title="Journeys"
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
      <div class="row">
    <div class="col s12">
      <ul class="tabs" id="tabs">
        <li class="tab col s3"><a class="active" href="#tab1">Notepad</a></li>
        <li class="tab col s3"><a href="#whiteboard">Whiteboard</a></li>
        <!-- <li class="tab col s3 disabled"><a href="#test3">Disabled Tab</a></li>
        <li class="tab col s3"><a href="#test4">Test 4</a></li> -->
      </ul>
    </div>
    <div id="tab1" class="col s12">
      <base-button @click="isDebugging = !isDebugging">(For debugging)</base-button>
      <base-button @click="resetBoard()">Reset whiteboard</base-button>
      <base-button @click="isEraser = true">Erase</base-button>
      <base-button @click="isEraser = false">Pen</base-button>
      <div class="center">
        <pulse-button 
          iconName="save" 
          @click="openJourneyPopup()"/>
      </div>
      <div style="margin-left: 120px;">
        <!-- Paper -->
        <paper ref="whiteboard" :isEraser="isEraser"/>
      </div>
        <p v-if="feedback" class="yellow-text center">{{ feedback }}</p>
      </div>
    <div id="whiteboard" class="col s12">Whiteboard</div>
    <!-- <div id="test3" class="col s12">Test 3</div>
    <div id="test4" class="col s12">Test 4</div> -->
  </div>
        

  </div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
import moment from 'moment'
import ChatNewMessage from '@/components/room/ChatNewMessage.vue'
import Paper from '@/components/room/Paper.vue'
import PulseButton from '@/components/reusables/PulseButton.vue'
import CollectionList from '@/components/reusables/CollectionList.vue'
import PopupModal from '@/components/reusables/PopupModal.vue'
import db from '@/firebase/init.js'
import { mapState } from 'vuex'

export default {
	components: {
		ChatNewMessage,
		Paper,
		PulseButton,
		CollectionList,
		PopupModal
	},
	data() {
		return {
			hasFetchedJourneys: false,
			isSharingJourney: false,
			chatroom: {},
			whiteboard: {},
			journeys: [],
			newJourneyTitle: '',
			feedback: '',
			usersViewingPage: [],
			isEraser: false,
			PRINT: null,
			isDebugging: false,
			fetchingJourneys: true
		}
	},
	computed: {
		...mapState(['user', 'hasFetchedUser']),
		isLoggedIn() {
			return this.user && this.hasFetchedUser
		},
		typingIndicator() {
			if (
				this.chatroom.whoIsTyping &&
				Object.keys(this.chatroom.whoIsTyping).length > 0
			) {
				return (
					Object.keys(this.chatroom.whoIsTyping)
						.map(key => this.chatroom.whoIsTyping[key])
						.join(', ') + ' is typing...'
				)
			}
			return '\xa0'
		},
		membersWithOnlineStatus() {
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
		usersAvalibility() {
			if (!this.chatroom) {
				return
			}
			if (!this.chatroom.participants) {
				return
			}
			const activeUIDs = this.usersViewingPage.reduce((prev, obj) => {
				prev[obj.uid] = true
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
		}
	},
	async created() {
		// add event listener to page to remove user from whoIsTyping
		window.onbeforeunload = async () => {
			const roomID = this.$route.params.room_id
			let chatRoomRef = db.collection('chatrooms').doc(roomID)
			let chatRoom = await chatRoomRef.get()
			const whoIsTyping = chatRoom.data().whoIsTyping
			delete whoIsTyping[this.user.uid]
			chatRoomRef.update({
				whoIsTyping
			})
		}
		// display users viewing the page
		const roomID = this.$route.params.room_id
		const membersRef = db.collection('users').where('isOnline', '==', true)
		const chatRef = db.collection('chatrooms').doc(roomID)
		const whiteboardDoc = db.collection('whiteboards').doc(roomID)
		const journeyRef = db
			.collection('conversations')
			.where('forGroup', '==', roomID)
		Promise.all([
			this.$bind('usersViewingPage', membersRef),
			this.$bind('whiteboard', whiteboardDoc),
			this.$bind('chatroom', chatRef),
			this.$bind('journeys', journeyRef)
		])
		this.fetchingJourneys = false
	},
	beforeRouteLeave(to, from, next) {
		// remove user from whoIsTyping
		const roomID = this.$route.params.room_id
		let chatRoomRef = db.collection('chatrooms').doc(roomID)
		chatRoomRef.get().then(chatRoom => {
			const whoIsTyping = chatRoom.data().whoIsTyping
			delete whoIsTyping[this.user.uid]
			chatRoomRef.update({
				whoIsTyping
			})
		})
		next()
	},
	async destroyed() {
		const ref = db.collection('users').doc(this.user.uid)
		ref.update({
			isTalking: false
		})
	},
	mounted() {
		const el = document.getElementById('tabs')
		M.Tabs.init(el, {})
	},
	methods: {
		openJourneyPopup() {
			this.isSharingJourney = true
			const journeyInput = this.$refs.journey
			this.$nextTick(() => {
				journeyInput.select()
			})
		},
		showGreenDot(isOnline) {
			return isOnline ? 'fiber_manual_record' : null
		},
		async newChatMessageChange(event) {
			if (!this.user.uid) {
				// early exit if user isn't loaded from db yet
				return
			}
			if (
				this.chatroom.whoIsTyping &&
				((event.target.value.length > 0 &&
					this.chatroom.whoIsTyping[this.user.uid]) ||
					(event.target.value.length === 0 &&
						!this.chatroom.whoIsTyping[this.user.uid]))
			) {
				// early exit condition so we don't have to query database everytime
				return
			}
			const roomID = this.$route.params.room_id
			const chatRoomRef = db.collection('chatrooms').doc(roomID)
			let chatRoom = await chatRoomRef.get()
			const whoIsTyping = chatRoom.data().whoIsTyping || {}
			event.target.value.length > 0
				? (whoIsTyping[this.user.uid] = this.user.displayName)
				: delete whoIsTyping[this.user.uid]
			chatRoomRef.update({
				whoIsTyping
			})
		},
		async resetMessages() {
			const roomID = this.$route.params.room_id
			const ref = db.collection('chatrooms').doc(roomID)
			await ref.update({
				messages: []
			})
		},
		resetBoard() {
			this.$refs.whiteboard.resetBoard()
		},
		async updateUser() {
			const ref = db.collection('users').doc(this.user.uid)
			await ref.update({
				firstTimeInChat: false
			})
		},
		prettifyDate(timestamp) {
			return moment(timestamp).format('lll')
		},
		async addToRecentChat() {
			const roomID = this.$route.params.room_id
			const userRef = db.collection('users').doc(this.user.uid)
			await userRef.update({
				isTalking: true,
				recentChatID: roomID
			})
		},
		handleMembershipLogic() {
			if (this.hasFetchedUser && this.user != null) {
				this.addToRecentChat()
			}
		},
		async updateParticipants() {
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
				chatrooms: firebase.firestore.FieldValue.arrayUnion(roomID)
			})
		},
		redirect({ id }) {
			const url = '/journey/' + id
			this.$router.push(url)
		},
		shareDismiss() {
			this.isSharingJourney = false
		},
		async shareJourney() {
			if (!(this.newJourneyTitle.length > 0)) {
				return
			}
			this.isSharingJourney = false
			this.feedback = 'Saving your explanation...'
			const allPaths = this.$refs.whiteboard.allPaths
			const conversation = {
				doodle: allPaths,
				messages: this.chatroom.messages,
				title: this.newJourneyTitle,
				forGroup: this.chatroom.id,
				owner: this.user.uid
			}
			this.PRINT = conversation
			this.feedback = 'So far so good...'
			this.newJourneyTitle = ''
			const convoRef = db.collection('conversations')
			this.feedback = 'Now the database call...'
			await convoRef.add(conversation)
			this.feedback = 'Success'
			setTimeout(() => (this.feedback = ''), 1000)
		},
		async updateTitle(event) {
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
		async processDeleteAttempt(journey) {
			if (
				journey.owner == this.user.uid ||
				this.user.displayName == 'Elton Lin'
			) {
				const ref = db.collection('conversations').doc(journey.id)
				await ref.delete()
			}
		},
		async leaveGroup() {
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

.user-online {
	font-size: 10px;
	color: #4aba34;
}
</style>
