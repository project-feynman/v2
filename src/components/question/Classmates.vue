<template>
  <div>        
    <template v-if="question[0]">
      <div class="container">
        <template v-if="students.length != 0">
          <ul class="collection with-header">
            <li class="collection-header">
              <h4>Classmates</h4>
            </li>
            <template v-for="f in students">
              <li :key="f.uid" class="collection-item white">
                <div>
                  <!-- <a @click="enterChat(f)" class="secondary-content btn-small btn-floating pulse pink message-button"><i class="material-icons">send</i></a> -->
                  Feynman #{{ f.feynmanNumber }}
                  <a @click="enterChat(f)" class="secondary-content"><i class="material-icons">send</i></a>
                </div>
              </li>
            </template>
          </ul>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import firebase from 'firebase'
import Promised from 'vue-promised'
import db from '@/firebase/init.js'

export default {
  components: {
    Promised
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
    async handleEureka () {
      var joinedReaction = false 
      this.question[0].feynmen.forEach(f => {
        if (f.uid == this.user.uid && f.mostRecentFeynman) {
          console.log('student had teachers')
          f.teacher = f.mostRecentFeynman.displayName
          f.chainReactionCreatorUID = f.mostRecentFeynman.chainReactionCreatorUID
          joinedReaction = true 
        }
      })
      const updatedFeynmen = this.question[0].feynmen 
      // user was not taught by anyone - let him start his own chain reaction
      if (!joinedReaction) {
        console.log('student was alone')
        this.question[0].feynmen.forEach(f => {
          if (f.uid == this.user.uid) {
            f.teacher = "Richard Feynman"
            f.chainReactionCreatorUID = f.uid 
          }
        })
      }
      const ref = db.collection('questions').doc(this.question[0].id)
      await ref.update({
        feynmen: updatedFeynmen
      })
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
  width: 25%;
}

.flexbox-container {
  display: flex;
}
</style>

