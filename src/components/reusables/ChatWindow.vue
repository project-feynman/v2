<template>
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
        {{typingIndicator}}
      </span>    
    </div>
    <div class="card-action">
      <div class="new-message">
        <form autocomplete="off" @submit.prevent="addMessage">
          <label for="new-message">Write a new message below...</label>
          <input type="text" name="new-message" @input="newChatMessageChange" v-model="newMessage">
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import firebase from 'firebase/app'
import db from '@/firebase/init.js'

export default {
	props: ['chatroom'],
	data() {
		return {
			participants: ['Elton', 'John', 'Qiantan'],
			newMessage: ''
		}
	},
	computed: {
		user() {
			return this.$store.state.user
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
		}
	},
	methods: {
		prettifyDate(timestamp) {
			return moment(timestamp).format('lll')
		},
		addMessage() {
			if (this.newMessage) {
				const content = this.newMessage
				this.newMessage = null
				const whoIsTyping = this.chatroom.whoIsTyping
				delete whoIsTyping[this.user.uid]
				const author = {
					displayName: this.user.displayName,
					uid: this.user.uid
				}
				this.chatroom.messages.push({
					content,
					author,
					timestamp: Date.now()
				})
				let chatRoomRef = db.collection('chatrooms').doc(this.chatroom.id)
				chatRoomRef.update({
					messages: this.chatroom.messages,
					participants: firebase.firestore.FieldValue.arrayUnion(author),
					whoIsTyping
				})
			}
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
			const chatRoomRef = db.collection('chatrooms').doc(this.chatroom.id)
			let chatRoom = await chatRoomRef.get()
			const whoIsTyping = chatRoom.data().whoIsTyping || {}
			event.target.value.length > 0
				? (whoIsTyping[this.user.uid] = this.user.displayName)
				: delete whoIsTyping[this.user.uid]
			chatRoomRef.update({
				whoIsTyping
			})
		}
	},
	created() {
		window.onbeforeunload = async () => {
			let chatRoomRef = db.collection('chatrooms').doc(this.chatroom.id)
			let chatRoom = await chatRoomRef.get()
			const whoIsTyping = chatRoom.data().whoIsTyping
			delete whoIsTyping[this.user.uid]
			await chatRoomRef.update({
				whoIsTyping
			})
		}
	}
}
</script>

<style scoped lang="scss">
h2 {
	@extend .center;
}

.button-wrapper {
	margin: auto;
}

input {
	color: black;
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