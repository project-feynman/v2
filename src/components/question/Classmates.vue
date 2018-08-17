<template>
  <div>
    <h4 class="center">Classmates</h4>
    <div class="center">
      <a @click="handleEureka()" class="waves-effect waves-light btn-large yellow-text">Eureka!!!</a>
    </div>
    <div v-if="question[0]">
      <div class="flexbox-container">
        <div class="container">
          <ul v-if="activeFeynmen.length != 0" class="collection with-header black">
            <li class="collection-header">
              <h4 class="black-text">Active Feynmen</h4>
            </li>
            <template v-for="f in activeFeynmen">
              <li :key="f.uid" class="collection-item avatar white">
                <i class="material-icons circle grey">person</i>
                <span class="title">{{ f.displayName }}</span>
                <p v-if="f.finished">Finished</p>
                <Promised :promise="checkOnline(f)">
                  <p>Fetching online status...</p>
                  <p slot-scope="data" class="green-text">{{ data }}</p>
                  <p slot="catch" slot-scope="error">Error: {{ error.message }}</p>
                </Promised>
                <a @click="enterChat(f)" class="secondary-content btn-floating pulse pink">
                  <i class="material-icons white-text">email</i>
                </a>
              </li>
            </template>
          </ul>
        </div>
        <div class="container">
          <ul v-if="students.length != 0" class="collection with-header black">
            <li class="collection-header"><h4 class="black-text">5 Most Recent Classmates</h4></li>
            <template v-for="f in students.slice(0, 50)">
              <li :key="f.uid" class="collection-item avatar white">
                <i class="material-icons circle grey">person</i>
                <span class="title">{{ f.displayName }}</span>
                <p v-if="!f.finished">Not Finished</p>
                <Promised :promise="checkOnline(f)">
                  <p>Fetching online status...</p>
                  <p slot-scope="data" class="green-text">{{ data }}</p>
                  <p slot="catch" slot-scope="error">Error: {{ error.message }}</p>
                </Promised>
                <a @click="enterChat(f)" class="secondary-content btn-floating pulse pink">
                  <i class="material-icons white-text">email</i>
                </a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
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
  created () {
    setTimeout(() => this.loading = false, 500)
  },
  computed: {
    user () {
      return this.$store.state.user 
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
  mounted () {
    this.$bind('question', db.collection('questions').where('questionID', '==', this.$route.path))
      .then(doc => {
        this.loading = false
        // TODO: one-way bind "isOnline" for each user 
        console.log('doc =', doc[0])
      })
      .catch(error => console.log(error))
  },
  methods: {
    async enterChat ({ uid, finished, displayName, chainReactionCreatorUID }) {
      // cannot chat with yourself 
      if (this.user.uid == uid) {
        return 
      }
      // if you're asking a Feynman, record it 
      if (chainReactionCreatorUID) {
        this.question[0].feynmen.forEach(f => {
          if (f.uid == this.user.uid) {
            // don't fuck with anything if the user is already part of a reaction
            if (f.chainReactionCreatorUID) {
              console.log('user is already part of a chain reaction')
              return 
            } else {
              const currentFeynman = {
                displayName,
                uid,
                chainReactionCreatorUID
              }
              f.mostRecentFeynman = currentFeynman
            }
          }
        })
        const ref = db.collection('questions').doc(this.question[0].id)
        const updatedFeynmen = this.question[0].feynmen 
        await ref.update({
          feynmen: updatedFeynmen
        })
      }
      // create a chat room 
      // make sure order of UIDs stays consistent no matter who asks for help
      const sortedUsers = [this.user.uid, uid].sort()
      const roomId = sortedUsers.join('')
      const doc = db.collection('chatRooms').doc(roomId)
      const chatRoom = await doc.get()
      if (!chatRoom.data()) {
        await doc.set({
          messages: [],
          participants: [sortedUsers[0], sortedUsers[1]],
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

<style scoped>
a {
  margin-top: 5px;
}

.collection-item {
  padding: 18px;
}

span, p {
  color: black;
}

.card-wrapper {
  margin: auto;
}

.container {
  padding-left: 8%;
  padding-right: 8%;
}

.teacher-section {
  padding-left: 8%;
  padding-right: 8%;
}

.flexbox-container {
  display: flex;
  justify-content: space-around;
}
</style>
