<template>
  <div>
    <h4 class="center">Student Explanations</h4>
    <div v-if="loading">
    </div>
    <div class="center add-button">
      <span @click="showForm = !showForm" class='btn-floating btn-large pink pulse'>
        <i v-if="!showForm" class='material-icons'>add</i>
        <i v-else class='material-icons'>close</i>
      </span>
    </div>
    <div v-if="showForm" class="new-explanation">
      <form>
        <input v-model="newExplanationTitle" placeholder="e.g. Master's Theorem" type="text">
        <label>Title</label>
        <input type="text" v-model="newExplanation" placeholder="A short explanation (< 150 words)">
        <label>Content</label>
      </form>
      <p class="pink-text text-lighten-3">(upload an image below to enhance your explanation)</p>
      <p class="white-text">
        (draw a doodle / upload a doodle (coming soon!))
      </p>
      <!-- draw on a whiteboard -->
      <!-- upload a recent whiteboard! -->
      <input type="file" placeholder="upload an image" @change="onFileChanged($event)">
      <p v-if="feedback" class="red-text">Enter BOTH a title and a link</p>
      <p v-if="uploadingImage" class="yellow-text">Uploading image...</p>
      <div class="right-align">
        <base-button @click="addExplanation()">Submit New Explanation</base-button>
      </div>
    </div>

    <ul v-if="!loading" v-for="(explanation, i) in explanations" :key="i">
      <div class="card-wrapper">
        <base-card>
          <li class="black-text center">{{ explanation.title }}: 
            <p class="black-text">{{ explanation.link }}</p>
            <!-- <a :href="getValidURL(explanation.link)" target="_blank">{{ explanation.link }}</a> -->
          </li>
          <li v-if="explanation.imageRef">
            <div class="center"><img :src="explanation.imageRef" class="center explanation-image"></div>
          </li>
          <template v-if="explanation.readers">
            <li class="black-text center">Views: {{ explanation.readers.length }}</li>
            <li class="black-text center">Confused readers: {{ getNumberOfConfusedReaders(explanation) }}</li>
          </template>
          <template v-if="explanation.upvotes">
            <li class="black-text center">{{ explanation.upvotes }} upvotes</li>
          </template>
          <span v-if="user.displayName == 'Elton Lin'" @click="deleteExplanation(explanation)" class='btn-floating btn-large halfway-fab red'>
            <i class='material-icons right'>delete_outline</i>
          </span>
          <div class="center">
            <span @click="upvote(explanation)" class='btn-floating btn-small pink pulse upvote'>
              <i class='material-icons'>thumb_up</i>
            </span>
          </div>
        </base-card>
      </div>
    </ul>
    
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
      explanations: [],
      loading: true,
      showForm: false,
      newExplanation: '',
      newExplanationTitle: '',
      selectedFile: null,
      feedback: false,
      uploadingImage: false,
    } 
  },
  mounted () {
    this.$bind('explanations', db.collection('explanations').where('forQuestion', '==', this.$route.path))
    .then((doc) => {
      this.loading = false 
    })
    .catch((error) => {
      console.log('error in loading: ', error)
    })
  },
  methods: {
    async deleteExplanation ({ id }) {
      const ref = db.collection('explanations').doc(id)
      await ref.delete()
    },
    getNumberOfConfusedReaders (explanation) {
      var count = 0 
      explanation.readers.forEach(reader => {
        if (reader.confused) { count += 1 }
      })
      return count 
    },
    async addExplanation () {
      if (!this.newExplanation || !this.newExplanationTitle) {
        this.feedback = true 
        return 
      }
      var author = {  
        uid: this.user.uid,
        displayName: this.user.displayName,
      }
      const ref = db.collection('explanations')
      const title = this.newExplanationTitle
      const link = this.newExplanation
      const forQuestion = this.$route.path
      this.newExplanation = ''
      this.newExplanationTitle = ''
      this.feedback = false 
      if (this.selectedFile) {
        this.uploadingImage = true 
        await this.onUpload() 
        const imgLocation = this.$route.path + '/' + this.selectedFile.name
        const storageRef = firebase.storage().ref()
        const url = await storageRef.child(imgLocation).getDownloadURL()
        await ref.add({
          'title': title,
          link,
          forQuestion,
          author,
          readers: [],
          imageRef: url
        })
        this.uploadingImage = false
      } else {
        await ref.add({
          title,
          link,
          forQuestion,
          author,
          readers: []
        })
      }
    },
    getValidURL (URL) {
      if (URL.substring(0, 4) == 'http') {
        return URL 
      } else if (URL.substring(0, 3) == 'www') {
        return `https://${URL.slice(4)}` // don't forget it's 'www.' not 'www'
      } else {
        return `https://${URL}`
      }
    },
    onFileChanged (event) {
      const file = event.target.files[0]
      this.selectedFile = file 
    },
    async onUpload () {
      if (!this.selectedFile) {
        return 
      }
      // route path is the questionID 
      const storagePath = this.$route.path + '/' + this.selectedFile.name
      const storage = firebase.storage().ref()
      const ref = storage.child(storagePath)
      await ref.put(this.selectedFile).then(snapshot => {
        console.log('Uploaded a blob or file!')
      })
    },
    async upvote ({ id, upvotes }) {
      const ref = db.collection('explanations').doc(id) 
      if (!upvotes) {
        await ref.update({
          upvotes: 1
        })
      } else {
        await ref.update({
          upvotes: upvotes + 1
        })
      }
    }
  }
}
</script>

<style scoped>
.new-explanation {
  width: 80%;
  margin: auto;
}

.card-wrapper {
  width: 80%;
  margin: auto;
}

.explanation-image {
  width: 100%;
  object-fit: cover;
}

.upvote {
  margin-top: 15px;
}

.add-button {
  padding-bottom: 10px;
}
</style>

