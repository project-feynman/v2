<template>
  <div>
    <h2 class="white-text center">Create New Group</h2>
    <div class="center">
      <pulse-button v-if="!showForm" @click="showForm = true" iconName="add"/>
      <pulse-button v-else @click="showForm = false" iconName="close"/>
    </div>
    <div v-if="showForm">
      <search-box v-if="objectOfStudents" 
                :allResults="objectOfStudents" 
                @select="payload => addFriend(payload)"/>
      <p class="yellow-text">{{ feedback }}</p>
      <h4>Nearest classmates</h4>
      <!-- Obtain location of classmates and the current user -->
      <h4>Classmates who study at the same time</h4>
      <!-- Get activity -->
    </div>
    <!-- Simple search select component -->
 </div>
</template>

<script>
import db from '@/firebase/init.js'
import SearchBox from '@/components/reusables/SearchBox.vue'
import firebase from 'firebase/app'
import 'firebase/firestore'
import PulseButton from '@/components/reusables/PulseButton.vue'

export default {
  components: {
    SearchBox,
    PulseButton
  },
  computed: {
    user () {
      return this.$store.state.user 
    }
  },
  data () {
    return {
      allStudents: [],
      objectOfStudents: null,
      feedback: '',
      showForm: false 
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
