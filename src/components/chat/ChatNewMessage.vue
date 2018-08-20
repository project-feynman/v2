<template>
  <div class="new-message">
    <form @submit.prevent="addMessage">
      <label for="new-message">New message</label>
      <input type="text" name="new-message" v-model="newMessage">
    </form>
  </div>
</template>

<script>
import firebase from 'firebase'
import db from '@/firebase/init.js'
import moment from 'moment'

export default {
  computed: {
    user () {
      return this.$store.state.user 
    }
  },
  data () {
    return {
      messages: null, 
      newMessage: null
    }
  },
  methods: {
    async addMessage () {
      if (this.newMessage) {
        const content = this.newMessage
        this.newMessage = null 
        let chatRoomRef = db.collection('chatRooms').doc(this.$route.params.room_id)
        let chatRoom = await chatRoomRef.get()
        this.messages = chatRoom.data().messages
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
          messages: this.messages
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
