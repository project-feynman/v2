<template>
  <div>        
    <template v-if="question[0] && studentsWorking && activeFeynmen">
      <collection-list :title="`${studentsWorking.length} classmates doing this question right now`"
                       :listItems="studentsWorking" 
                       @entire-click="student => enterChat(student)"
                       actionIcon="chat"
                       @item-click="student => enterChat(student)">
        <template slot-scope="{ item }">
          Feynman #{{ item.feynmanNumber }}
        </template>
      </collection-list>
      <collection-list :title="`${activeFeynmen.length} classmates finished and want to help`"
                       :listItems="activeFeynmen" 
                       @entire-click="student => enterChat(student)"
                       actionIcon="message"
                       @item-click="student => enterChat(student)">
        <template slot-scope="{ item }">
          Feynman #{{ item.feynmanNumber }}
        </template>
      </collection-list> 
      <collection-list title="0 Teaching Assistants">
      </collection-list>
      <collection-list title="0 Professors">
      </collection-list>
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
    // uses "statusOfClassmates" and "students" to compute output 
    studentsWorking () { 
      console.log(`this.students = ${this.students}`)
      if (this.students == []) {
        return 
      }
      if (this.students.length == 0) {
        return 
      }
      if (this.statusOfClassmates == []) {
        return 
      }
    var output = []
      // filter the old fashion way 
      console.log('status of classmates =', this.statusOfClassmates)
      var n = this.students.length 
      for (var i = 0; i < n; i++) {
        const isOnline = this.statusOfClassmates[i]
        console.log(`i = ${i}, isOnline = ${isOnline}`)
        if (isOnline) {
          const student = this.students[i]
          output.push(student)
        }
      }
      return output 
    },
    students () {
      const output = this.question[0].feynmen
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
      loading: true,
      statusOfClassmates: [] 
    }
  },
  async mounted () {
    const ref = db.collection('questions').where('questionID', '==', this.$route.path)
    await this.$bind('question', ref)
    this.loading = false
     // TODO: one-way bind "isOnline" for each user 
  },
  watch: {
    loading () { // uses "this.students" to compute "this.statusOfClassmates"
      if (this.loading == false) {
        // set up snapshot listeners - and bind them to "statusOfClassmates"
        const students = this.students 
        const n = students.length 
        this.statusOfClassmates = new Array(n).fill(false)
        for (var i = 0; i < n; i++) {
          const student = students[i]
          console.log(`student = ${student}`)
          const ref = db.collection('users').doc(student.uid)
          ref.onSnapshot(doc => {
            if (doc.exists) {
              // console.log(`doc data = ${JSON.stringify(doc.data())}`)
              this.statusOfClassmates[i] = doc.data().isOnline 
            }
          })
        }
        console.log(`after initially snapshots, status of classmates = ${this.statusOfClassmates}`)
      }
    }
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

