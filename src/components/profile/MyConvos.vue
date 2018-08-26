<template>
  <h2>My Conversations</h2>
</template>

<script>
import db from '@/firebase/init.js'

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
      const convos = this.user.conversations
      convos.forEach(async convo => {
        // get document from firestore 
        const ref = db.collection('conversations').doc(convo)
        const doc = await ref.get() 
        if (doc.exists) {
          console.log(`doc data = ${JSON.stringify(doc.data())}`)
          // display scrollable message 
          // display whiteboard 
        }
      })
    } else {
      console.log('user directly visited this page')
    }
  }
}

</script>
