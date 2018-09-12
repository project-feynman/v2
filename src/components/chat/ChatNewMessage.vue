<template>
  <div class="new-message">
    <form @submit.prevent="addMessage">
      <label for="new-message">New message</label>
      <input type="text" name="new-message" v-model="newMessage">
    </form>
  </div>
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
        const roomID = this.$route.params.room_id
        let chatRoomRef = db.collection('chatrooms').doc(roomID)
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

        // if (!this.participants.includes(author)) {
        //   console.log('new author')
        //   var copy = this.participants
        //   copy.push(author)
        //   await chatRoomRef.update({
        //     messages: this.messages,
        //     participants: copy 
        //   })
        // } else {
        await chatRoomRef.update({
          messages: this.messages,
          participants: firebase.firestore.FieldValue.arrayUnion(author)
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
