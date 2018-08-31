<template>
  <div class="pset">
    <div class="custom-offset"></div>
    <h2 class="center">{{ $route.params.subject_id }} P-Set {{ $route.params.pset_number }}</h2>
    <div v-if="loading" class="spinner-wrapper">
      <base-spinner/>
    </div>
    <template v-if="allQuestions && !loading && isLoggedIn">
      <div class="question-card">
        <base-card v-for="(question, i) in allQuestions" :key="i">
          <h5>{{ getLastChar(question.questionID) }}. {{ question.content }}</h5>
          <!-- Classmate's Progress -->
          <ul>
            <li>{{ getNumberOfFinishedClassmates(question)}} / {{ question.feynmen.length }} classmates finished</li>
            <li>Avg. time: {{ getEstimatedTime(question) }} hours</li>
          </ul>
          <!-- if the user is done and has not submitted -->
          <duration-form v-if="user.uid && getUserProgress(question) && !didUserSubmitATimeAlready(question)" 
                             :questionID="question.id" 
                             :userUID="user.uid"
                             class="question-duration"
                             ></duration-form>
          <span v-else-if="didUserSubmitATimeAlready(question)" class="green-text">
            Time submission recorded
           </span>
          <BaseCheckBox 
            :value="getUserProgress(question)"
            @toggle="toggle(question, $event)">
            <p v-if="!getUserProgress(question)" class="pink-text">(check the box when you finish)</p>
            <p v-else class="green-text">(you're done)</p>
          </BaseCheckBox> 
          <!-- Link -->
          <div class="card-action">
            <router-link :to="$route.path + `/${getLastChar(question.questionID)}`" class="purple-text">
              <base-button>Start question</base-button>
            </router-link>
          </div> 
          <!-- Delete Button -->
          <span v-if="user.displayName == 'Elton Lin'" @click="deleteQuestion(question.id)" class='btn-floating btn-large halfway-fab red'>
            <i class='material-icons right'>delete_outline</i>
          </span>
        </base-card>
      </div>
    </template>
      <form>
        <div class="new-question">
          <input type="text" v-model="newQuestion">
          <label>Question</label>
        </div>
        <div class="new-question-number">
          <input type="number" v-model="newQuestionNumber">
          <label>Question Number</label>
        </div>
      </form>
      <p v-if="feedback" class="red-text center">{{ feedback }}</p>
      <div class="right-align">
        <base-button @click="addQuestion()">Submit New Question</base-button>
      </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import db from '@/firebase/init.js'
import DurationForm from '@/components/pset/DurationForm.vue'

export default {
  components: {
    DurationForm,
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    isLoggedIn () {
      return this.user != null && this.user != 'undetermined'
    }
  },
  data () {
    return {
      allQuestions: false,
      newQuestion: null,
      newQuestionNumber: null,
      loading: true,
      feedback: null
    }
  },
  async mounted () {
    this.addToRecentPset()
    const ref = db.collection('questions').where('fromPset', '==', this.$route.path)
    await this.$bind('allQuestions', ref)
    this.loading = false 
  },
  methods: {
    async addQuestion () {
      // check if the question is unique 
      var isDuplicate = false 
      this.allQuestions.forEach(question => {
        const questionNumber = question.questionID.slice(question.questionID.length - 1)
        if (questionNumber == this.newQuestionNumber) {
          isDuplicate = true 
          this.feedback = `Someone already submitted a question ${questionNumber}`
        }
      })
      if (isDuplicate) {
        return 
      }
      if (!this.newQuestion || !this.newQuestionNumber) {
        this.feedback = 'You must specify BOTH the question and the question number'
        return 
      }
      // create question object 
      const questionID = this.$route.path + '/' + this.newQuestionNumber 
      const questionObject = {
        content: this.newQuestion,
        fromPset: this.$route.path,
        questionID,
        feynmen: [{
          displayName: this.user.displayName,
          uid: this.user.uid,
          feynmanNumber: this.user.feynmanNumber,
          finished: false
        }]
      }
      this.newQuestion = null
      this.newQuestiomNumber = null
      this.feedback = null 
      // upload it to Firestore
      const ref = db.collection('questions')
      await ref.add(questionObject)
    },
    async deleteQuestion (id) {
      const ref = db.collection('questions').doc(id)
      await ref.delete()
    },
    async toggle ({ feynmen, id, total }, newValue) {
      if (newValue == false) {
        var previousSubmittedValue = null 
        feynmen.forEach(f => {
          if (f.uid == this.user.uid) {
            previousSubmittedValue = f.submittedTime 
            f.finished = false
            f.submitted = false  
            f.submittedTime = 0
          }
        })
        // revert the total only if the user had submitted a value previously
        if (!isNaN(previousSubmittedValue)) {
          total = total - previousSubmittedValue 
        }
        await db.collection('questions').doc(id).update({
          total,
          feynmen
        })
      } else { // easy case 
        feynmen.forEach(feynman => {
          if (feynman.uid == this.user.uid) {
            feynman.finished = newValue 
          }
        })
        const ref = db.collection('questions').doc(id)
        await ref.update({
          feynmen
        })
      }
    },
    getUserProgress (question) {
      const enrolledUser = question.feynmen.find(f => f.uid == this.user.uid)
      if (enrolledUser) {
        return enrolledUser.finished
      } else {
        this.enrollUser(question)
      }
    },
    async enrollUser ({ feynmen, id }) {
      feynmen.push({
        displayName: this.user.displayName,
        uid: this.user.uid,
        finished: false,
        feynmanNumber: this.user.feynmanNumber
      })
      const ref = db.collection('questions').doc(id)
      await ref.update({
        feynmen
      })
    },
    getLastChar (string) {
      return string.substr(string.length - 1)
    },
    getEstimatedTime ({ feynmen, total }) {
      const finishedClassmates = feynmen.filter(f => f.finished)
      const n = finishedClassmates.length 
      if (n == 0 || !total) {
        return 'N/A'
      } else {
        return total / n
      }
    },
    getNumberOfFinishedClassmates (question) {
      const finishedClassmates = question.feynmen.filter(f => f.finished)
      return finishedClassmates.length
    },
    didUserSubmitATimeAlready ({ feynmen }) {
      var submitted = false 
      feynmen.forEach(f => {
        if (f.uid == this.user.uid) {
          submitted = f.submitted 
        } 
      })
      return submitted 
    },
    async addToRecentPset () {
      if (!this.isLoggedIn) {
        return 
      }
      const userRef = db.collection('users').doc(this.user.uid)
      await userRef.update({
        recentPsetID: this.$route.path
      })
    },
  }
}
</script>

<style lang="scss" scoped>
li {
  @extend .black-text;
}

h5 {
  @extend .teal-text;
}
</style>

<style scoped>
.flexbox-container {
  display: flex;
}

.custom-offset {
  padding-top: 3%;
}

.question-card {
  width: 60%;
  margin: auto;
}

.new-question {
  width: 60%;
  margin: auto;
}

.new-question-number {
  width: 15%;
  margin: auto;
}

h2 {
  padding-bottom: 5%;
}

.spinner-wrapper {
  margin-left: 49%;
}
</style>
