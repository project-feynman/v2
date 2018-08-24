<template>
  <div>
    <div class="custom-offset"></div>
    <h2 class="center">All Subjects</h2>
    <div v-if="loading" class="spinner-wrapper">
      <base-spinner></base-spinner>
    </div>
    <template v-if="subjects && !loading" class="subject-card">
      <div class="subject-card">
        <template v-for="(subject, i) in subjects">
          <base-card :key="i">
            <h4 class="black-text">{{ subject.subjectNumber }}</h4>
            <base-button @click="redirectToPset(subject)">Start p-set {{ getCurrentPset(subject) }}</base-button>
            <base-button @click="$router.push(`${subject.subjectNumber}`)">View all p-sets</base-button>
          </base-card>
        </template>
      </div>
    </template>
    <div v-if="user">
      <div v-if="user.admin == true" class="new-subject">
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
  mounted () {
    this.$bind('subjects', db.collection('subjects'))
    .then((doc) => {
      this.loading = false 
    })
    .catch((error) => {
      console.log('error in loading: ', error)
    })
  },
  methods: {
    async addSubject () {
      const newObject = {
        subjectNumber: this.newSubject
      }
      const ref = db.collection('subjects').doc(this.newSubject)
      await ref.set(newObject)
    },
    getCurrentPset ({ psets }) {
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

<style scoped>
.custom-offset {
  padding-top: 60px;
}

h2 {
  padding-bottom: 50px;
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





