<template>
  <div>
    <h2>Conversation</h2>
    <whiteboard v-if="doodle" :allStrokes="doodle"/>
    <message-board v-if="messages" :messages="messages"/>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import Whiteboard from '@/components/reusables/Whiteboard.vue'
import MessageBoard from '@/components/reusables/MessageBoard.vue'

export default {
  components: {
    Whiteboard,
    MessageBoard
  },
  computed: {
    user () {
      return this.$store.state.user 
    },
    isLoggedIn () {
      return this.user != 'undetermined' && this.user != null
    }
  },
  data () {
    return {
      doodle: [],
      messages: [],
      hasFetchedConversation: false 
    }
  },
  created () {
    if (this.isLoggedIn) { 
      this.fetchConversation()
    } 
    // if the user directly visited this page, see 'watch' hook below  
  },
  watch: {
    user () {
      if (this.isLoggedIn) {
        if (this.hasFetchedConversation == false) {
          this.fetchConversation() 
        }
      }
    }
  },
  methods: {
    async fetchConversation () {
      // get document from firestore 
      const id = this.$route.params.convo_id
      const ref = db.collection('conversations').doc(id) // user ID 
      const doc = await ref.get() 
      if (doc.exists) {
        // display whiteboard 
        this.doodle = doc.data().doodle
        this.messages = doc.data().messages 
        this.hasFetchedConversation = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
h2 {
  @extend .center;
}
</style>