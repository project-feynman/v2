<template>
  <div>
    <div class="custom-offset"></div>
    <h2>Classes</h2>
    <div v-if="loading" class="spinner-wrapper">
      <base-spinner/>
    </div>
    <template v-if="subjects && !loading && isLoggedIn">
      <div class="subject-card">
        <template v-for="(subject, i) in user.enrolledSubjects">
          <base-card :key="i">
            <h4 class="teal-text text-darken-2">{{ subject }}</h4>
            <base-button @click="redirectToPset(subject)" buttonColor="pink">
              P-set {{ getCurrentPset(subject) }}
            </base-button>
            <base-button @click="$router.push(`/study-groups/${subject.subjectNumber}`)" buttonColor="pink">
              Groups
            </base-button>
            <base-button @click="$router.push(`${subject.subjectNumber}`)" buttonColor="pink">
              P-sets
            </base-button>
          </base-card>
        </template>
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
import db from '@/firebase/init.js'

export default {
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
    await this.$bind('subjects', db.collection('subjects'))
    this.loading = false 
    if (this.isLoggedIn) {
      if (this.user.enrolledSubjects.length == 0) {
        this.$router.push('add-classes')
      }
    }
  },
  methods: {
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
  padding-top: 60px;
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





