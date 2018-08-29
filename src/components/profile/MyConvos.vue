<template>
  <div>
    <h2>My Conversations</h2>
    <ul>
      <li v-for="(convo, idx) in pastConversations" :key="idx">
        <router-link :to="'conversation' + '/' + convo">{{ convo }}</router-link>
      </li>
    </ul>
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
      pastConversations: []
    }
  },
  created () {
    if (this.isLoggedIn) {
      this.pastConversations = this.user.conversations
    } else {
      // user directly visited this page, see 'watch' hook below  
    }
  },
  watch: {
    user () {
      if (this.isLoggedIn) {
        this.pastConversations = this.user.conversations
      }
    }
  },
  methods: {
    displayPastConverations () {

    }
  }
}
</script>

<style lang="scss" scoped>
h2 {
  @extend .center;
}
</style>
