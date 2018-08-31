<template>
  <div>
    <div class="custom-offset"></div>
    <h2>All Subjects</h2>
    <div v-if="loading" class="spinner-wrapper">
      <base-spinner/>
    </div>
    <template v-if="subjects && !loading">
      <div class="subject-card">
        <template v-for="(subject, i) in subjects">
          <base-card :key="i">
            <h4>{{ subject.subjectNumber }}</h4>
            <base-button @click="redirectToPset(subject)">
              Start p-set {{ getCurrentPset(subject) }}
            </base-button>
            <base-button @click="$router.push(`${subject.subjectNumber}`)">
              View all p-sets
            </base-button>
          </base-card>
        </template>
      </div>
    </template>
    <div v-if="user">
      <div v-if="user.admin == true || user.displayName == 'Elton Lin'" class="new-subject">
        <form @submit.prevent="addSubject()">
          <label>Add Subject</label>
          <input type="text" v-model="newSubject">
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import db from '@/firebase/init.js'

export default {
  computed: {
    user () {
      return this.$store.state.user 
    }
  },
  data () {
    return {
      subjects: [],
      newSubject: '',
      loading: true,
    }
  },
  async mounted () {
    await this.$bind('subjects', db.collection('subjects'))
    this.loading = false 
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





