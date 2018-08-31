<template>
  <div>        
    <template v-if="question[0]">
      <collection-list :listItems="students" @item-click="student => enterChat(student)"/>
    </template>
  </div>
</template>

<script>
import firebase from 'firebase'
import Promised from 'vue-promised'
import db from '@/firebase/init.js'
import CollectionList from '@/components/reusables/CollectionList.vue'

export default {
  components: {
    Promised,
    CollectionList
  },
  computed: {
    user () {
      return this.$store.state.user 
    },
    students () {
      var output = this.question[0].feynmen
      return output.filter(f => f.chainReactionCreatorUID == null)
    }
  },
  data () {
    return { 
      question: [],
      loading: true 
    }
  },
  async mounted () {
    const ref = db.collection('questions').where('questionID', '==', this.$route.path)
    await this.$bind('question', ref)
    this.loading = false
     // TODO: one-way bind "isOnline" for each user 
  },
  methods: {
    async enterChat ({ uid, finished, displayName, chainReactionCreatorUID }) {
      // cannot chat with yourself 
      if (this.user.uid == uid) {
        return 
      }
      // create a chat room 
      const sortedUIDs = [this.user.uid, uid].sort() 
      const roomId = sortedUIDs.join('')
      const doc = db.collection('chatRooms').doc(roomId)
      const chatRoom = await doc.get()
      if (!chatRoom.exists) {
        const currentUser = {
          displayName: this.user.displayName,
          uid: this.user.uid 
        }
        const feynman = {
          displayName,
          uid
        }
        await doc.set({
          title: 'Click to edit title (press ENTER to save)',
          messages: [],
          participants: [currentUser, feynman],
          forQuestion: this.$route.path,
        })
        const whiteboardRef = db.collection('whiteboards').doc(roomId) 
        await whiteboardRef.set({
          allPaths: []
        })
      }
      this.$router.push('/chat/' + roomId)
      // TODO: notify user 
    },
    async checkOnline ({ uid }) {
      const ref = db.collection('users').doc(uid)
      const feynman = await ref.get()
      if (feynman.exists) {
        const result = feynman.data().isOnline
        if (!result || result == false) {
          return 'offline'
        } else {
          return 'online'
        } 
      }
    } 
  }
}
</script>

<style lang="scss" scoped>
h4 {
  @extend .teal-text;
}

p, div {
  @extend .black-text;
}

.card-wrapper {
  margin: auto;
}

.container {
  width: 100%;
}

.flexbox-container {
  display: flex;
}
</style>

