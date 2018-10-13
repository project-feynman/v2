<template>
  <div class="new-message">
    <form autocomplete="off" @submit.prevent="addMessage">
      <label for="new-message">Write a new message below...</label>
      <input type="text" name="new-message" @input="emitChange" v-model="newMessage">
    </form>
  </div>
  <!-- Add comments and remove print statements -->
</template>


<script>
import firebase from 'firebase/app'
import 'firebase'
import 'firebase/firestore'
import db from '@/firebase/init.js'
import moment from 'moment'

export default {
	props: {
		participants: Array
	},
	computed: {
		user() {
			return this.$store.state.user
		}
	},
	data() {
		return {
			messages: null,
			newMessage: null
		}
	},
	methods: {
		emitChange(event) {
			this.$emit('onInputChange', event)
		},
		async addMessage() {
			if (this.newMessage) {
				const content = this.newMessage
				this.newMessage = null
				const roomID = this.$route.params.room_id
				let chatRoomRef = db.collection('chatrooms').doc(roomID)
				let chatRoom = await chatRoomRef.get()
				const data = chatRoom.data()
				this.messages = data.messages
				const whoIsTyping = data.whoIsTyping
				delete whoIsTyping[this.user.uid]
				const author = {
					displayName: this.user.displayName,
					uid: this.user.uid
				}
				this.messages.push({
					content,
					author,
					timestamp: Date.now()
				})
				await chatRoomRef.update({
					messages: this.messages,
					participants: firebase.firestore.FieldValue.arrayUnion(author),
					whoIsTyping
				})
			}
		}
	}
}
</script>

<style scoped>
input {
	color: black;
}
</style>
