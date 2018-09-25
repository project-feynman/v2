<template>
  <div>
    <template v-if="isChangingPset">
      <popup-modal @close="updateNewestPset()">
        <input slot="header" placeholder="Enter the new p-set number" class="teal-text center" v-model="newPset">
      </popup-modal>
    </template>
    <div class="custom-offset"></div>
    <h2>Dashboard</h2>
    <p v-if="loading" class="white-text center">Fetching your classes...</p>
    <template v-if="subjects && !loading && isLoggedIn">
      <div class="responsive-grid">
          <template v-for="(subject, i) in subjects">
            <div class="subject-card" :key="i">
              <base-card>
                <h4 class="black-text">{{ subject.subjectNumber }}</h4>
                <floating-button 
                              color="pink"
                              iconName="slideshow" 
                              @click="$router.push('/study-groups/' + subject.subjectNumber + '/' + getCurrentPset(subject))"/>
                <template v-if="user.displayName == 'Elton Lin'">
                  <floating-button iconName="settings" 
                            color="grey darken-1" 
                            @click="startEdit(subject)"/>
                  <floating-button iconName="delete" 
                            color="black" 
                            @click="removeSubject(subject)"/>
                </template>
              </base-card>
            </div>
          </template>
      </div>
    </template>
    <manage-classes @add-class="loadSubjects()"></manage-classes>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import PulseButton from '@/components/reusables/PulseButton.vue'
import FloatingButton from '@/components/reusables/FloatingButton.vue'
import PopupModal from '@/components/reusables/PopupModal.vue'
import ManageClasses from '@/components/dashboard/ManageClasses.vue'
import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  components: {
    PulseButton,
    FloatingButton,
    PopupModal,
    ManageClasses
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
      subjects: [],
      enrolledSubjects: [],
      newSubject: '',
      loading: true,
      isChangingPset: false,
      subjectEditted: null,
      newPset: null,
      hasLoadedSubjects: false,
      feedback: ''
    }
  },
  async created () {
    if (this.isLoggedIn) {
      this.loadSubjects()
    }
  },
  watch: {
    user () {
      if (this.isLoggedIn) {
        if (!this.hasLoadedSubjects) {
          this.loadSubjects()
        }
      }
    }
  },
  methods: {
    startEdit (subject) {
      this.subjectEditted = subject 
      this.isChangingPset = true 
    },
    async updateNewestPset () {
      if (!this.newPset) {
        return 
      }
      this.isChangingPset = false 
      const ref = db.collection('subjects').doc(this.subjectEditted.subjectNumber)
      await ref.update({
        psets: firebase.firestore.FieldValue.arrayUnion(this.newPset)
      })
      this.newPset = null 
    },
    async removeSubject (subject) {
      const ref = db.collection('users').doc(this.user.uid) 
      await ref.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayRemove(subject.subjectNumber)
      })
      this.loadSubjects() 
    },
    async loadSubjects () {
      this.feedback = 'Fetching your classes...'
      if (!this.user.enrolledSubjects) {
        this.loading = false 
        this.subjects = [] 
        this.feedback = 'Add a class below to get started'
      }
      if (this.user.enrolledSubjects.length == 0) {
        this.loading = false 
        this.subjects = [] 
        this.feedback = 'Add a class below to get started'
      } else {
        this.subjects = [] 
        this.user.enrolledSubjects.forEach(async subj => {
          const ref = db.collection('subjects').doc(subj)
          const subjDoc = await ref.get() 
          this.subjects.push(subjDoc.data())
        })
        this.loading = false 
      }
      this.feedback = ''
      this.hasLoadedSubjects = true
    },
    getCurrentPset ({ psets }) {
      if (!psets) {
        return 
      }
      if (psets.length == 0) {
        return 
      }
      const lastPset = psets[psets.length - 1]
      return lastPset 
    },
    redirectToPset ({ subjectNumber, psets }) {
      const URL = subjectNumber + '/' + psets[psets.length -1]
      this.$router.push(URL)
    }
  }
}
</script>


<style lang="scss" scoped>
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 0.97fr));
  grid-gap: 30px;
  max-width: 90%;
  margin: 0 auto 30px;
}

h2 {
  @extend .center;
  padding-bottom: 50px;
}

h4 {
  @extend .black-text;
}

.custom-offset {
  padding-top: 30px;
}

.new-subject {
  margin: auto;
  width: 65%;
}

.spinner-wrapper {
  margin-left: 49%;
}
</style>




