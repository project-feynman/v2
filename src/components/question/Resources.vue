<template>
  <div>
    <h4 class="center">Question Resources</h4>
    <div v-if="loading" class="center">Loading related resources...</div>
    <template v-if="questions[0]">
      <div class="center">
        <span @click="showForm = !showForm" class='btn-floating btn-large pink pulse'>
          <i class='material-icons'>add</i>
        </span>
      </div>
      <div v-if="showForm" class="new-resource">
        <form>
          <input type="text" v-model="newResourceTitle" placeholder="e.g. Recitation Notes">
          <label>Add a title to the resource</label>
          <input v-model="newResource" type="text" placeholder="e.g. stellar.mit.edu/6.006">
          <label>Add a Stellar, Piazza or CSAIL link</label>
        </form>
        <p v-if="feedback" class="red-text">Enter BOTH a title and a link</p>
        <div class="right-align">
          <base-button @click="addResource(questions[0])">Submit New Resource</base-button>
        </div>
      </div>

      <template v-for="(resource, i) in questions[0].resources">
        <div class="card-wrapper" :key="i">
          <base-card>
            <div class="black-text">{{ resource.title }}</div>
            <a :href="getValidURL(resource.url)" target="_blank">{{ resource.url }}</a>
            <span v-if="user.displayName == 'Elton Lin'" @click="deleteResource(questions[0], resource.title)" class='btn-floating btn-large halfway-fab red'>
              <i class='material-icons right'>delete_outline</i>
            </span>
          </base-card>
        </div>
      </template>
    </template>
    
  </div>
</template>

<script>
import db from '@/firebase/init.js'

export default {
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  created () {
    setTimeout(() => this.loading = false, 500)
  },
  data () {
    return {
      questions: [],
      showForm: false,
      newResource: '',
      newResourceTitle: '',
      loading: true,
      feedback: false 
    }
  },
  firestore () {
    return {
      questions: db.collection('questions').where('questionID', '==', this.$route.path)
    }
  },
  methods: {
    async addResource ({id, resources}) {
      if (!this.newResource || !this.newResourceTitle) {
        this.feedback = true 
        return 
      }
      if (resources) {
        const newObj = {
          url: this.newResource,
          title: this.newResourceTitle
        }
        resources.push(newObj)
        db.collection('questions').doc(id).update({
          resources
        })
      } else {
        const newObj = {
          url: this.newResource,
          title: this.newResourceTitle
        }
        db.collection('questions').doc(id).update({
          resources: [newObj]
        })
      }
      this.newResource = ''
      this.newResourceTitle = ''
      this.feedback = false 
    },
    async deleteResource ({id, resources}, deleteTitle) {
      for (var i = 0; i < resources.length; i++) {
        if (resources[i].title == deleteTitle) {
          resources.splice(i, 1)
        }
      }
      await db.collection('questions').doc(id).update({
        resources
      })
    },
    getValidURL (URL) {
      if (URL.substring(0, 4) == 'http') {
        return URL 
      } else if (URL.substring(0, 3) == 'www') {
        return `https://${URL.slice(4)}` // don't forget it's 'www.' not 'www'
      } else {
        return `https://${URL}`
      }
    }
  }
}
</script>

<style scoped>
.card-wrapper {
  width: 80%;
  margin: auto;
}

.new-resource {
  max-width: 70%;
  margin: auto;
}
</style>
