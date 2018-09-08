<template>
  <div>
    <h2 class="white-text center">Class Directory</h2>
    <search-box v-if="classes" :allResults="objectOfClasses" label="Search classes"/>
    <p v-if="feedback" class="yellow-text">{{ feedback }}</p>
    <p v-if="objectOfClasses">{{ objectOfClasses }}</p>
    <h2 v-if="isLoggedIn">user = {{ user.enrolledSubjects }}</h2>
    <p v-if="classes">{{ classes }}</p>
    <!-- <ul>
      <li v-for="(subject, idx) in classes" :key="idx">{{ subject }}</li>
    </ul> -->
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import SearchBox from '@/components/reusables/SearchBox.vue'

export default {
  components: {
    SearchBox
  },
  computed: {
    user () {
      return this.$store.state.user 
    },
    isLoggedIn () {
      return this.user != 'undetermined' && this.user != null 
    }
  },
  data () {
    return {
      classes: [],
      hasFetchedClasses: false,
      feedback: '',
      objectOfClasses: {} 
    }
  },
  async created () {
    const ref = db.collection('subjects')
    await this.$bind('classes', ref)
    this.classes.forEach(c => {
      console.log(`class = ${c}`)
      this.objectOfClasses[c.subjectNumber] = null 
    })
    console.log(`object of classes = ${JSON.stringify(this.objectOfClasses)}`)

    // if (this.isLoggedIn) {
    //   this.classes = this.user.classes 
    //   this.hasFetchedClasses = true 
    // } else {
    //   this.feedabck = 'You are not logged in (somehow)'
    // }
  },
  // watch: {
  //   user () {
  //     if (this.isLoggedIn && !this.hasFetchedClasses) {
  //       this.classes = this.user.classes 
  //       this.hasFetchedClasses = true 
  //     }
  //   }
  // }
}
</script>

