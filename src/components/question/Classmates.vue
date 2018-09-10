<template>
  <div>
    <template v-if="question[0] && studentsWorking && onlineActiveFeynmen">
      <!-- <div class="center">
        <base-button @click="$router.push(`/study-groups/${$route.params.subject_id}`)">Create/Join a Study Group</base-button>
      </div> -->
      <!-- <collection-list title="Your study group"
                       :listItems="friends">
      </collection-list> -->
      <collection-list :title="`${studentsWorking.length} classmates doing this question right now`"
                       :listItems="studentsWorking" 
                       @entire-click="student => enterChat(student)"
                       actionIcon="chat"
                       @item-click="student => enterChat(student)">
        <template slot-scope="{ item }">
          Feynman #{{ item.displayName }}
        </template>
      </collection-list>
      <collection-list :title="`${onlineActiveFeynmen.length} classmates finished and want to help`"
                       :listItems="onlineActiveFeynmen" 
                       @entire-click="student => enterChat(student)"
                       actionIcon="message"
                       @item-click="student => enterChat(student)">
        <template slot-scope="{ item }">
          {{ item.displayName }}
        </template>
      </collection-list> 
      <!-- <collection-list title="0 Teaching Assistants">
      </collection-list>
      <collection-list title="0 Professors">
      </collection-list> -->
    </template>
    <template v-else>
      <h5 class="center white-text">Nobody is online currently - get your friends to join so it's not so lonely</h5>
    </template>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
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
    isLoggedIn () {
      return this.user != null && this.user != 'undetermined'
    },
    allOnlineStudents () {
      if (!this.question) {
        return 
      }
      if (this.question[0]) {
        var output = []
        const n = this.question[0].feynmen.length 
        for (var i = 0; i < n; i++) {
          if (this.allStudentStatuses[i] == true) {
            output.push(this.question[0].feynmen[i])
          }
        }
        return output 
      }
    },
    studentsWorking () {
      if (this.allOnlineStudents) {
        return this.allOnlineStudents.filter(student => student.chainReactionCreatorUID == null)
      }
    },
    onlineActiveFeynmen () {
      if (this.allOnlineStudents) {
        var output = this.allOnlineStudents
        output = output.filter(f => f.chainReactionCreatorUID != null)
        output = output.filter(f => f.retired != true || f.retired == null)
        return output 
      }
    }
  },
  data () {
    return { 
      question: [],
      loading: true,
      allStudentStatuses: [],
      friends: []
    }
  },
  async mounted () {
    const ref = db.collection('questions').where('questionID', '==', this.$route.path)
    try {
      await this.$bind('question', ref)
      this.loading = false
    } catch (e) {
      console.log('internet connection is sketchy...cannot fetch data reliably')
    }
    if (this.isLoggedIn) {
      this.friends = this.user.friends 
    }
  },
  watch: {
    async loading () { // uses "this.students" to compute "this.statusOfClassmates"
      if (this.loading == false) {
        const feynmen = this.question[0].feynmen 
        const n = feynmen.length 
        this.allStudentStatuses = new Array(n).fill(0)
        for (var i = 0; i < n; i++) {
          const ref = db.collection('users').doc(feynmen[i].uid)
          const idx = i
          await ref.onSnapshot(doc => {
            if (!doc.exists) {
              return 
            }
            const data = doc.data()
            if (data.isTalking != null) {
              const available = data.isOnline && !data.isTalking
              this.allStudentStatuses.splice(idx, 1, available)
            } else {
              this.allStudentStatuses.splice(idx, 1, data.isOnline)
            }
          })
        }
      }
    }
  },
  methods: {
    setStatus (idx, isOnline) {
      this.statusOfClassmates[idx] = isOnline 
    },
    async enterChat ({ uid, finished, displayName, chainReactionCreatorUID }) { 
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
          title: 'Edit title (ENTER to save)',
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

