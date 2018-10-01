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
    <template v-if="hasFetchedUser">
      <p v-if="!user.enrolledSubjects" class="yellow-text center">Add a class from below to get started.</p>
      <p v-else-if="user.enrolledSubjects.length == 0" class="yellow-text center">Add a class from below to get started</p>
    </template>
    <div style="width: 50%; margin: auto;">
      <search-box v-if="objectOfClasses"
        label="Add a class to dashboard" 
        :allResults="objectOfClasses"   
        @select="payload => addClass(payload)"/>
    </div>
    <div style="width: 50%; margin: auto;">
      <div class="row">
        <div class="col s12">
          <div class="row">
            <form @submit.prevent="addSubject()">
              <div class="input-field col s12">
                <i class="material-icons prefix">add</i>
                <input type="text" id="new-subject" v-model="newSubject">
                <label for="new-subject">Create new subject on Feynman</label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { mapState } from 'vuex'
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
    ...mapState(['user', 'hasFetchedUser']), // returns an array of objects, which we then "spread" out with "..."" 
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
          enrolledSubjects: firebase.firestore.FieldValue.arrayUnion(subjectNumber)
        })
      }
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
  }
}
</script>
