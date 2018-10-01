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
    <template v-if="betaSubjects && !loading && isLoggedIn">
      <div class="responsive-grid">
          <template v-for="(subject, i) in betaSubjects">
            <div class="subject-card" :key="i">
              <base-card>
                <h4 class="black-text">{{ subject.subjectNumber }}</h4>
                <floating-button 
                              color="pink"
                              iconName="slideshow" 
                              @click="$router.push('/study-groups/' + subject.subjectNumber + '/' + getCurrentPset(subject))"/>
                <template v-if="user.displayName == 'Elton Lin'">
                  <floating-button 
                            iconName="delete" 
                            color="black" 
                            @click="removeSubject(subject)"/>
                </template>
              </base-card>
            </div>
          </template>
      </div>
    </template>
    <manage-classes></manage-classes>
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
      feedback: '',
      betaSubjects: []
    }
  },
  watch: {
    user: {
      handler: 'fetchSubjectDocs', // 'loadSubjects'
      immediate: true
    }
  },

  methods: {
    startEdit (subject) {
      this.subjectEditted = subject 
      this.isChangingPset = true 
    },
    async fetchSubjectDocs () {
      if (!this.user.enrolledSubjects) {
        return 
      }
      const subjects = this.user.enrolledSubjects
      const n = subjects.length 
      this.betaSubjects = new Array(n).fill(0)
      for (var i=0; i<n; i++) {
        const ref = db.collection('subjects').doc(subjects[i])
        const idx = i // necessary - snapShots persist after the function call, and it'll reference the final value of i (which is n)
        ref.onSnapshot(doc => {
          if (!doc.exists) {
            return 
          }
          else {
            let data = doc.data()
            data.id = doc.id 
            this.$set(this.betaSubjects, idx, data)
          }
        })
      }
      this.loading = false 
      this.hasLoadedSubjects = true
    },
    async removeSubject (subject) {
      const ref = db.collection('users').doc(this.user.uid) 
      await ref.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayRemove(subject.subjectNumber)
      })
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




