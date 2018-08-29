<template>
  <div>
    <h2>Question {{ $route.params.question_number }}</h2>
    <h3 v-if="question[0]" class="question-text">
      {{ question[0].content }}
    </h3>
    <div class="row">
      <div class="col s12">
        <ul id="tabs" class="tabs">
          <li class="tab col s3"><a href="#test1" class="teal-text">Journeys</a></li>
          <li class="tab col s3"><a href="#test2" class="teal-text">Resources</a></li>
          <li class="tab col s3"><a href="#test3" class="teal-text">Classmates</a></li>
          <li class="tab col s3"><a href="#test4" class="teal-text">Chain Reaction</a></li>
        </ul>
      </div>
      <div id="test1" class="col s12 m12">
        <!-- <explanations/> -->
        <journeys v-if="question[0] && isLoggedIn" 
                  :journeys="question[0].journeys" 
                  :user="user"
                  @delete="payload => deleteJourney(payload)"
                  ></journeys>
      </div>
      <div id="test2" class="col s12 m12">
        <resources/>
      </div>
      <div id="test3" class="col s12 m12">
        <classmates/>
      </div>
      <div id="test4" class="col s12 m12">
        <feynmen></feynmen>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import db from '@/firebase/init.js'
import Explanations from '@/components/question/Explanations.vue'
import Resources from '@/components/question/Resources.vue'
import Classmates from '@/components/question/Classmates.vue'
import ChainReaction from '@/components/question/ChainReaction.vue'
import Feynmen from '@/components/question/Feynmen.vue'
import Journeys from '@/components/question/Journeys.vue'

export default {
  computed: {
    user () {
      return this.$store.state.user 
    },
    isLoggedIn () {
      return this.user != 'undetermined' && this.user != null
    }
  },
  created () {
    this.addToRecentQuestion()
  },
  mounted () {
    const el = document.getElementById('tabs')
    const options = {}
    const instance = M.Tabs.init(el, options)
  },
  components: {
    Explanations,
    Classmates,
    Resources,
    ChainReaction,
    Feynmen,
    Journeys
  },
  data () {
    return {
      question: []
    }
  },
  firestore () {
    return {
      question: db.collection('questions').where('questionID', '==', this.$route.path)
    }
  },
  methods: {
    async addToRecentQuestion () {
      if (!this.isLoggedIn) {
        return 
      }
      const userRef = db.collection('users').doc(this.user.uid)
      await userRef.update({
        recentQuestionID: this.$route.path
      })
    },
    async deleteJourney (journey) {
      console.log(`journey = ${JSON.stringify(journey)}`)
      // actually, just remove the reference to the 'journey' from the question 
      console.log('question i =', this.question[0].id)
      const questionRef = db.collection('questions').doc(this.question[0].id)
      await questionRef.update({
        regions: firebase.firestore.FieldValue.arrayRemove(journey)
      })
      console.log('successfully removed journey from the array')
    }
  }
}
</script>

<style lang="scss" scoped>
h2, h3 {
  @extend .center;
}

.back-button {
  @extend .center;
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>

<style scoped>
.custom-offset {
  padding-top: 60px;
}

.question-text {
  margin: auto;
  width: 80%;
  padding-bottom: 20px;
}
</style>
