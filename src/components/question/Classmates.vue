<template>
  <div>
    <!-- <p v-if="question" class="white-text">students: {{ students }}</p>
    <p v-if="question" class="white-text">statusOfStudents: {{ statusOfClassmates }}</p>
    <p v-if="question" class="white-text">studentsWorking: {{ studentsWorking }}</p> -->
    <template v-if="question[0] && studentsWorking && onlineActiveFeynmen">
      <collection-list :title="`${studentsWorking.length} classmates doing this question right now`"
                       :listItems="studentsWorking" 
                       @entire-click="student => enterChat(student)"
                       actionIcon="chat"
                       @item-click="student => enterChat(student)">
        <template slot-scope="{ item }">
          Feynman #{{ item.feynmanNumber }}
        </template>
      </collection-list>
      <collection-list :title="`${onlineActiveFeynmen.length} classmates finished and want to help`"
                       :listItems="onlineActiveFeynmen" 
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
    studentsWorking () { 
      if (this.students) {
        var output = [] 
        const n = this.students.length 
        for (var i = 0; i < n; i++) {
          if (this.statusOfClassmates[i] == true) {
            console.log('student is online, his name is', this.students[i].displayName)
            output.push(this.students[i])
          }
        }
        return output
      }
    },
    students () {
      if (this.question && this.question[0]) {
        const output = this.question[0].feynmen
        return output.filter(f => f.chainReactionCreatorUID == null)
      }
    },
    onlineActiveFeynmen () {
      // the problem with computing online users is that 
      // it might be an expensive operation 
      // perhaps, might it be better to use a 'where' query for all the users who are online 
      if (this.activeFeynmen) {
        var output = [] 
        const n = this.activeFeynmen.length 
        for (var i = 0; i < n; i++) {
          if (this.statusOfActiveFeynmen[i] == true) {
            const feynman = this.activeFeynmen[i]
            console.log('feynman is onlien, his name is', feynman.displayName)
            output.push(feynman)
          }
        }
        return output 
      }
    },
    activeFeynmen () {
      if (this.question && this.question[0]) {
        // get people who are online first - then filter them 
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
      statusOfClassmates: [],
      statusOfActiveFeynmen: [] 
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
  },
  watch: {
    async loading () { // uses "this.students" to compute "this.statusOfClassmates"
      if (this.loading == false) {
        if (this.students != null) {
          const students = this.students 
          const n = students.length 
          this.statusOfClassmates = new Array(n).fill(0)
          for (var i = 0; i < n; i++) {
            const student = students[i]
            const ref = db.collection('users').doc(student.uid)
            const idx = i // necessary line, because the snapshot hook reads the latest value of i (which is likely to be when i has finished iterating and is equal to n)
            await ref.onSnapshot(doc => {
              this.statusOfClassmates.splice(idx, 1, doc.data().isOnline)
            })
          }
        }
        if (this.activeFeynmen != null) {
          const n = this.activeFeynmen.length 
          this.statusOfActiveFeynmen = new Array(n).fill(0)
          for (var i = 0; i < n; i++) {
            const feynman = this.activeFeynmen[i] 
            const ref = db.collection('users').doc(feynman.uid) 
            const idx = i
            await ref.onSnapshot(doc => {
              this.statusOfActiveFeynmen.splice(idx, 1, doc.data().isOnline )
            })
          }
        }
        // set up snapshot listeners for students - and bind them to "statusOfClassmates"
        
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

