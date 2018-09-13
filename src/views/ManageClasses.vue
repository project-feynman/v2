<template>
  <div>
    <template v-if="isLoggedIn">
      <popup-modal v-if="user.firstTimePickingClasses" @close="updateUser()">
        <p slot="header" class="teal-text center">
          Feynman is a place where you can find study groups spontaneously - by letting you find people
          in similar situations with similar needs. Get started by selecting your classes. 
        </p>
      </popup-modal>
    </template>
    <h2 class="white-text center">Class Directory</h2>
    <p v-if="feedback" class="yellow-text center">{{ feedback }}</p>
    <div class="searchbox-wrapper">
      <search-box v-if="objectOfClasses"
        label="Search classes" :allResults="objectOfClasses" @select="payload => addClass(payload)"/>
    </div>
    <!-- <div class="center">
      <base-button @click="resetClasses()" buttonColor="red darken-4">Reset classes</base-button>
    </div> -->
    <p v-if="isLoggedIn" class="center">Your classes: {{ user.enrolledSubjects }}</p>
    <div class="center" style="padding-top: 25px;">
      <pulse-button @click="$router.push('/subjects')" iconName="dashboard" tooltipText="Head to dashboard"/>
    </div>
    <div v-if="user">
      <div v-if="user.admin == true || user.displayName == 'Elton Lin'" 
           style="width: 70%; margin: auto;">
        <form @submit.prevent="addSubject()">
          <label>Add Subject</label>
          <input type="text" v-model="newSubject">
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import firebase from 'firebase/app'
import 'firebase/firestore'
import SearchBox from '@/components/reusables/SearchBox.vue'
import PopupModal from '@/components/reusables/PopupModal.vue'
import PulseButton from '@/components/reusables/PulseButton.vue'

export default {
  components: {
    SearchBox,
    PopupModal,
    PulseButton
  },
  computed: {
    user () {
      return this.$store.state.user 
    },
    isLoggedIn () {
      return this.user != 'undetermined' && this.user != null 
    },
    objectOfClasses () {
      if (this.classes) {
        var output = {}
        this.classes.forEach(c => {
          output[c.subjectNumber] = null 
        })
        return output 
      }
    }
  },
  data () {
    return {
      classes: [],
      hasFetchedClasses: false,
      feedback: '',
      newSubject: '',
    }
  },
  async created () {
    const ref = db.collection('subjects')
    await this.$bind('classes', ref)
  },
  methods: {
    async updateUser () {
      const ref = db.collection('users').doc(this.user.uid)
      await ref.update({
        firstTimePickingClasses: false 
      })
    },
    async addClass (subjectNumber) {
      if (this.isLoggedIn) {
        const ref = db.collection('users').doc(this.user.uid)
        await ref.update({
          enrolledSubjects: firebase.firestore.FieldValue.arrayUnion({subjectID: subjectNumber})
        })
      }
    },
    async resetClasses () {
      const ref = db.collection('users').doc(this.user.uid) 
      await ref.update({
        enrolledSubjects: [] 
      })
    },
    async addSubject () {
      const newObject = {
        subjectNumber: this.newSubject,
        psets: [1]
      }
      const ref = db.collection('subjects').doc(this.newSubject)
      this.newSubject = ''
      await ref.set(newObject)
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

