<template>
  <div>        
    <template v-if="question[0]">
      <collection-list title="Classmates doing this question right now"
                       :listItems="students" 
                       @entire-click="student => enterChat(student)"
                       actionIcon="chat"
                       @item-click="student => enterChat(student)">
        <template slot-scope="{ item }">
          Feynman #{{ item.feynmanNumber }}
        </template>
      </collection-list>
      <collection-list title="Classmates who finished and want to help"
                       :listItems="activeFeynmen" 
                       @entire-click="student => enterChat(student)"
                       actionIcon="message"
                       @item-click="student => enterChat(student)">
        <template slot-scope="{ item }">
          Feynman #{{ item.feynmanNumber }}
        </template>
      </collection-list>
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
    },
    activeFeynmen () {
      if (!this.question[0]) {
        return []
      } else if (this.question[0]) {
        var output = this.question[0].feynmen 
        output = output.filter(f => f.chainReactionCreatorUID != null)
        output = output.filter(f => f.retired != true || f.retired == null)
        return output 
      }
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
      console.log(`enterChat()`)
      // cannot chat with yourself 
      if (this.user.uid == uid && this.user.displayName != 'Elton Lin') {
        return 
      }
      // check if room exists 
      const sortedUIDs = [this.user.uid, uid].sort() 
      const joinedUIDs = sortedUIDs.join('-')
      var questionID = this.$route.path.split('/').join('-')
      const roomId = joinedUIDs + questionID 
      const doc = db.collection('chatRooms').doc(roomId)
      const chatRoom = await doc.get()
      if (!chatRoom.exists) {
        // create a chat room 
        const currentUser = {
          displayName: this.user.displayName,
          uid: this.user.uid 
        }
        const feynman = {
          displayName,
          uid
        }
        await doc.set({
          title: 'Click to edit title (ENTER to save)',
          messages: [],
          participants: [currentUser, feynman],
          forQuestion: this.$route.path,
        })
        const whiteboardRef = db.collection('whiteboards').doc(roomId) 
        await whiteboardRef.set({
          allPaths: []
        })
      }
      // notify feynman
      const notif = {
        roomId,
        new: true 
      }
      const feynmanRef = db.collection('users').doc(uid) 
      feynmanRef.update({
        notifications: firebase.firestore.FieldValue.arrayUnion(notif)
      })
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
    },
    handleEntireClick () {
      console.log('entire item was clicked (rather than the action button on the rightmost side')
    },
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

