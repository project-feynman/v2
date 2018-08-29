<template>
  <div>
    <h2>My Conversations</h2>
    <template v-if="doodle">
      <whiteboard :allStrokes="doodle"></whiteboard>
    </template>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import Whiteboard from '@/components/reusables/Whiteboard.vue'

export default {
  components: {
    Whiteboard
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
      doodle: null,
      hasFetchedConversation: false 
    }
  },
  created () {
    if (this.isLoggedIn) {
      this.fetchConversation()
    } else {
      // user directly visited this page, see 'watch' hook below  
    }
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
    fetchConversation () {
      const convos = this.user.conversations
      convos.forEach(async convo => {
        // get document from firestore 
        const ref = db.collection('conversations').doc(convo)
        const doc = await ref.get() 
        if (doc.exists) {
          // display whiteboard 
          this.doodle = doc.data().doodle
          // display scrollable message 
          this.hasFetchedConversation = true
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
h2 {
  @extend .center;
}
</style>
