<template>
  <div>
    <h2>Question {{ $route.params.question_number }}</h2>
    <h3 v-if="question[0]" class="question-text">
      {{ question[0].content }}
    </h3>
    <div class="row">
      <div class="col s12">
        <ul id="tabs" class="tabs">
          <li class="tab tooltipped col s3" 
              data-tooltip="When you're in a chat session with a classmate, 
                            you can save and share the interaction for others to see">
            <a href="#test1">Classroom</a>
          </li>
          <li class="tab tooltipped col s3"
              data-tooltip="Helpful external resources found by others">
            <a href="#test2">Resources</a></li>
          <li class="tab tooltipped col s3"
              data-tooltip="Actionable insights for staff members">
            <a href="#test3">Statistics</a></li>
        </ul>
      </div>
      <div id="test1" class="col s12 m12">
        <!-- <explanations/> -->
        <journeys v-if="question[0] && isLoggedIn" 
                  :journeys="question[0].journeys" 
                  :user="user"
                  @delete="payload => deleteJourney(payload)"></journeys>
      </div>
      <div id="test2" class="col s12 m12">
        <resources/>
      </div>
      <div id="test3" class="col s12 m12">
       <h2>Coming soon!</h2>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
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
    if (this.isLoggedIn) {
      this.addToRecentQuestion() // set is talking to false too 
    }
  },
  watch: {
    isLoggedIn () {
      if (this.isLoggedIn) {
        this.addToRecentQuestion() 
      }
    }
  },
  mounted () {
    // initialize tabs
    const el = document.getElementById('tabs')
    const instance = M.Tabs.init(el, {})
    // initialize tooltips 
    const elems = document.querySelectorAll('.tooltipped')
    var instances = M.Tooltip.init(elems, {})
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
      question: [],
      initialized: false 
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
      if (this.initialized) {
        return 
      }
      const userRef = db.collection('users').doc(this.user.uid)
      await userRef.update({
        recentQuestionID: this.$route.path,
        isTalking: false 
      })
      this.initialized = true 
      console.log('updated isTalking to false')
    },
    async deleteJourney (journey) {
      const questionRef = db.collection('questions').doc(this.question[0].id)
      await questionRef.update({
        journeys: firebase.firestore.FieldValue.arrayRemove(journey)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
h2, h3 {
  @extend .center;
}

a {
  @extend .teal-text;
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
