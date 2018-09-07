<template>
  <div>
    <!-- Simple search select component -->
    <search-box v-if="objectOfStudents" :allResults="objectOfStudents"/>
    <h2>Nearest classmates</h2>
    <!-- Obtain location of classmates and the current user -->
    <h2>Classmates with most similar habits</h2>
    <!-- Get activity -->
 </div>
</template>

<script>
import db from '@/firebase/init.js'
import SearchBox from '@/components/reusables/SearchBox.vue'

export default {
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
  }
}
</script>
