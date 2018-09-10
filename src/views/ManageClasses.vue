<template>
  <div>
    <h2 class="white-text center">Class Directory</h2>
    <p v-if="feedback" class="yellow-text center">{{ feedback }}</p>
    <div class="searchbox-wrapper">
      <search-box v-if="classes"
        label="Search classes" :allResults="objectOfClasses" @select="payload => addClass(payload)"/>
    </div>
    <p v-if="isLoggedIn" class="center">Your classes: {{ user.enrolledSubjects }}</p>
    <div class="center">
      <base-button @click="resetClasses()" buttonColor="red darken-4">Reset classes</base-button>
      <base-button @click="$router.push('/subjects')" buttonColor="pink">Back to dashboard</base-button>
    </div>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import firebase from 'firebase/app'
import 'firebase/firestore'
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
    },
    isNewUser () {
      if (!isLoggedIn) {
        return 
      } 
      if (!this.user.enrolledSubjects) {
        this.feedback = "Welcome - to get started, select classes you're taking this term"
      } else {
        this.feedback = 'Now, join a study group within that class to access the group chat'
      }
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
      this.objectOfClasses[c.subjectNumber] = null 
    })

    // if (this.isLoggedIn) {
    //   this.classes = this.user.classes 
    //   this.hasFetchedClasses = true 
    // } else {
    //   this.feedabck = 'You are not logged in (somehow)'
    // }
  },
  methods: {
    async addClass (subjectNumber) {
      if (this.isLoggedIn) {
        const ref = db.collection('users').doc(this.user.uid)
        await ref.update({
          enrolledSubjects: firebase.firestore.FieldValue.arrayUnion({subjectID: subjectNumber})
        })
        console.log('successfully added subject')
      }
    },
    async resetClasses () {
      const ref = db.collection('users').doc(this.user.uid) 
      await ref.update({
        enrolledSubjects: [] 
      })
    }
  },
  watch: {
    isLoggedIn () {
      if (this.isLoggedIn) {
        if (!this.user.enrolledSubjects) {
          this.feedback = "Welcome - to get started, select classes you're taking this term" 
        } else if (this.user.enrolledSubjects.length == 0) {
          this.feedback = "Welcome - to get started, select classes you're taking this term" 
        }
      }
    }
  }
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

<style scoped lang="scss">
.searchbox-wrapper {
  width: 50%;
  margin: auto;
}
</style>

