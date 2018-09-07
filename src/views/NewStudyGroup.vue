<template>
  <div>
    <!-- Simple search select component -->
    <search-box v-if="objectOfStudents" 
                :allResults="objectOfStudents" 
                @select="payload => addFriend(payload)"/>
    <h2>Nearest classmates</h2>
    <!-- Obtain location of classmates and the current user -->
    <h2>Classmates who study at the same time</h2>
    <!-- Get activity -->
 </div>
</template>

<script>
import db from '@/firebase/init.js'
import SearchBox from '@/components/reusables/SearchBox.vue'
import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  computed: {
    user () {
      return this.$store.state.user 
    }
  },
  components: {
    SearchBox
  },
  data () {
    return {
      allStudents: [],
      objectOfStudents: null
    }
  },
  async created () {
    const ref = db.collection('users')
    await this.$bind('allStudents', ref)
    const object = {}
    this.allStudents.forEach(student => {
      object[student.displayName] = null
    })
    this.objectOfStudents = object
  },
  methods: {
    async addFriend (student) {
      console.log('addFriend()')
      console.log(`student = ${student}`)
      const ref = db.collection('users').doc(this.user.uid)
      await ref.update({
        friends: firebase.firestore.FieldValue.arrayUnion(student)
      })
    }
  },
}
</script>
