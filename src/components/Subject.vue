<template>
  <div>
    <div class="custom-offset"></div>
    <h2 class="center">{{ $route.params.subject_id }}</h2>
    <div v-if="loading" class="spinner-wrapper">
      <base-spinner></base-spinner>
    </div>
    <div v-if="subject && !loading" class="pset-card">
      <template v-for="(pset, i) in subject.psets">
        <base-card  :key="i" class="pset-card" @click="redirectToPset(pset)">
          <p class="black-text">Enter P-Set {{ pset }}</p>
          <span v-if="user.displayName == 'Elton Lin'" @click="deletePset(pset)" class='btn-floating btn-large halfway-fab red'>
            <i class='material-icons right'>delete_outline</i>
          </span>
        </base-card>
      </template>
    </div>
    <form class="new-pset" v-if="user.displayName == 'Elton Lin'" @submit.prevent="addPset()">
      <label>Add Pset</label>
      <input type="text" v-model="newPset">
    </form>
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
  mounted () {
  this.$bind('subject', db.collection('subjects').doc(this.$route.params.subject_id))
    .then(doc => {
      this.loading = false 
    })
    .catch(error => {
      console.log('error in loading: ', error)
    })
  },
  data () {
    return {
      newPset: null,
      subject: null,
      loading: true
    }
  },
  methods: {
    async addPset () {
      var psets = this.subject.psets 
      if (!psets) {
        psets = [] 
      } 
      psets.push(this.newPset)
      this.newPset = ''
      const ref = db.collection('subjects').doc(this.$route.params.subject_id)
      await ref.update({
        psets
      })
    },
    async deletePset (psetNumber) {
      // this reflects the pset number
    },
    redirectToPset (pset) {
      const URL = this.$route.path + '/' + `${pset}`
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

.new-pset {
  width: 62%;
  margin: auto;
}

.pset-card {
  width: 80%;
  margin: auto;
}

.spinner-wrapper {
  margin-left: 49%;
}
</style>


