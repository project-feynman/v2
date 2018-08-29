<template>
  <div>
    <h2>Conversation</h2>
    <template v-if="doodle">
      <whiteboard :allStrokes="doodle"/>
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
    async fetchConversation () {
      // get document from firestore 
      const id = this.$route.params.convo_id
      console.log(`conversation ID = ${id}`)
      const ref = db.collection('conversations').doc(id) // user ID 
      const doc = await ref.get() 
      if (doc.exists) {
        // display whiteboard 
        this.doodle = doc.data().doodle
        // display scrollable message 

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