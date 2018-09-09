<template>
  <div>
    <h2>{{ title }}</h2>
    <div class="flexbox-container">
      <div class="doodle-wrapper">
        <template v-if="!doodle">
          <p>Fetching doodle...</p>
        </template>
        <template v-else>
          <doodle :allStrokes="doodle"/>
        </template>
      </div>
      <div class="messages-wrapper">
        <message-history v-if="messages" :messages="messages"/>
      </div>
    </div>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import Doodle from '@/components/reusables/Doodle.vue'
import MessageHistory from '@/components/reusables/MessageHistory.vue'

export default {
  components: {
    Doodle,
    MessageHistory
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
      title: '',
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
      const ref = db.collection('conversations').doc(id)
      const doc = await ref.get() 
      if (doc.exists) {
        // display Doodle 
        this.doodle = doc.data().doodle
        this.messages = doc.data().messages 
        this.title = doc.data().title 
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

.flexbox-container {
  display: flex;
  justify-content: space-around;
}

.doodle-wrapper, .messages-wrapper {
  width: 45%;
}
</style>