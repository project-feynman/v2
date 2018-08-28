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
    }
  },
  data () {
    return {
      doodle: null
    }
  },
  created () {
    if (this.user != 'undetermined' && this.user != null) {
      const convos = this.user.conversations
      convos.forEach(async convo => {
        // get document from firestore 
        const ref = db.collection('conversations').doc(convo)
        const doc = await ref.get() 
        if (doc.exists) {
          console.log(`doc data = ${JSON.stringify(doc.data())}`)
          // display whiteboard 
          this.doodle = doc.data().doodle
          // display scrollable message 
        }
      })
    } else {
      console.log('user directly visited this page')
    }
  }
}
</script>
