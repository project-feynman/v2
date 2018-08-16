<template>
  <div class="new-message">
    <form @submit.prevent="addMessage">
      <label for="new-message">New Message (ENTER to add)</label>
      <input type="text" name="new-message" v-model="newMessage">
    </form>
  </div>
</template>

<script>
import firebase from 'firebase'
import db from '@/firebase/init.js'
import moment from 'moment'

export default {
  data () {
    return {
      messages: null, // used to update Firestore after newMessage is added
      newMessage: null
    }
  },
  methods: {
    async addMessage () {
      if (this.newMessage) {
        let chatRoomRef = db.collection('chatRooms').doc(this.$route.params.room_id)
        let chatRoom = await chatRoomRef.get()
        this.messages = chatRoom.data().messages
        this.messages.push({
          content: this.newMessage,
          author: firebase.auth().currentUser.displayName,
          timestamp: Date.now()
        })
        await chatRoomRef.update({
          messages: this.messages
        })
        this.newMessage = null
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
