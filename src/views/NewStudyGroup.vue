<template>
  <div>
    <!-- Simple search select component -->
    <search-box v-if="objectOfStudents" 
                :allResults="objectOfStudents" 
                @select="payload => addFriend(payload)"/>
    <p class="yellow-text">{{ feedback }}</p>
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
      objectOfStudents: null,
      feedback: ''
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
      this.feedback = 'Adding him/her to the study group'
      const ref = db.collection('users').doc(this.user.uid)
      await ref.update({
        friends: firebase.firestore.FieldValue.arrayUnion(student)
      })
      this.feedback = `Successfully added ${student}`
      setTimeout(() => this.feedback = '', 2000)
    }
  },
}
</script>
