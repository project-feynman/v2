<template>
  <h2>My Conversations</h2>
</template>

<script>
export default {
  computed: {
    user () {
      return this.$store.state.user 
    }
  },
  created () {
    if (this.user != 'undetermined' && this.user != null) {
      console.log('app was already opened')
      console.log(`convos = ${JSON.stringify(this.user.conversations)}`)
    } else {
      console.log('user directly visited this page')
    }
  }
}

</script>
