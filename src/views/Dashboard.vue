<template>
  <div>
    <div class="custom-offset"></div>
    <h2>Dashboard</h2>
    <div v-if="loading" class="spinner-wrapper">
      <base-spinner/>
    </div>
    <template v-if="subjects && !loading && isLoggedIn">
      <div class="subject-card">
        <template v-for="(subject, i) in subjects">
          <base-card :key="i">
            <h4 class="teal-text text-darken-2">{{ subject.subjectNumber }}</h4>
            <!-- <p class="black-text">Study group: Joe, Karina, Matt</p>
            <p class="pink-text">Joe and Karina are p-setting</p> -->
            <p class="green-text">{{ parseInt(10 * Math.random()) }} classmates p-setting</p>
            <!-- <base-button @click="redirectToPset(subject)" buttonColor="pink">
              P-set {{ getCurrentPset(subject) }}
            </base-button> -->
            <pulse-button iconName="input" 
                          tooltipText="Hello, world!"
                          @click="redirectToPset(subject)"/>
            <base-button @click="$router.push(`/study-groups/${subject.subjectNumber}`)">
              Study Groups
            </base-button>
            <!-- <base-button @click="$router.push(`${subject.subjectNumber}`)">
              View past material
            </base-button> -->
          </base-card>
        </template>
      </div>
      <div class="center">
        <base-button @click="$router.push('/add-classes')">Manage classes</base-button>
      </div>
    </template>
    <!-- <div v-if="user">
      <div v-if="user.admin == true || user.displayName == 'Elton Lin'" class="new-subject">
        <form @submit.prevent="addSubject()">
          <label>Add Subject</label>
          <input type="text" v-model="newSubject">
        </form>
      </div>
    </div> -->
  </div>
</template>

<script>
// get the corresponding document for each subject the user is taking
import db from '@/firebase/init.js'
import PulseButton from '@/components/reusables/PulseButton.vue'

export default {
  mounted () {
    const elems = document.querySelectorAll('.tooltipped')
    var instances = M.Tooltip.init(elems)
  },
  components: {
    PulseButton
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
      newSubject: '',
      loading: true,
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
        this.loadSubjects()
      }
    }
  },
  methods: {
    async loadSubjects () {
      if (this.loading == false) {
        return 
      }
      if (!this.user.enrolledSubjects) {
        this.$router.push('add-classes')
      }
      if (this.user.enrolledSubjects.length == 0) {
        this.$router.push('add-classes')
      } else {
        this.user.enrolledSubjects.forEach(async subj => {
          const ref = db.collection('subjects').doc(subj.subjectID)
          const subjDoc = await ref.get() 
          this.subjects.push(subjDoc.data())
        })
        this.loading = false 
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
h2 {
  @extend .center;
  padding-bottom: 50px;
}

h4 {
  @extend .black-text;

}
</style>

<style scoped>
.custom-offset {
  padding-top: 30px;
}

.subject-card {
  margin: auto;
  width: 65%;
}

.new-subject {
  margin: auto;
  width: 65%;
}

.spinner-wrapper {
  margin-left: 49%;
}
</style>





