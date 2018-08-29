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

export default {
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
    } 
  },
  // user directly visited this page
  watch: {
    user () {
      if (this.isLoggedIn) {
        this.pastConversations = this.user.conversations
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
