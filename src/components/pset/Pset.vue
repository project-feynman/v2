<template>
  <div class="pset">
    <div class="custom-offset"></div>
    <h2 class="center">{{ $route.params.subject_id }} P-Set {{ $route.params.pset_number }}</h2>
    <div v-if="loading" class="spinner-wrapper">
      <base-spinner></base-spinner>
    </div>
    <template v-if="allQuestions && !loading">
      <div class="question-card">
        <base-card v-for="(question, i) in allQuestions" :key="i">
          <h5>{{ question.content }}</h5>
          <!-- Classmate's Progress -->
          <ul>
            <li class="teal-text">{{ getNumberOfFinishedClassmates(question)}}</li>
            <li class="teal-text">Avg. time: {{ getEstimatedTime(question) }} hours</li>
          </ul>
          <!-- if the user is done and has not submitted -->
          <question-duration v-if="user.uid && getUserProgress(question) && !didUserSubmitATimeAlready(question)" 
                             :questionID="question.id" 
                             :userUID="user.uid"
                             class="question-duration"
                             ></question-duration>
          <span v-else class="green-text">
            Time submission recorded
           </span>
          <BaseCheckBox 
            :value="getUserProgress(question)"
            @toggle="toggle(question, $event)">
            <p class="pink-text">(Check the box when you finish)</p>
          </BaseCheckBox> 
          <!-- Link -->
          <div class="card-action">
            <router-link :to="$route.path + `/${getLastChar(question.questionID)}`" class="black-text">
              Start question
            </router-link>
          </div> 
          <!-- Delete Button -->
          <span v-if="user.displayName == 'Elton Lin'" @click="deleteQuestion(question.id)" class='btn-floating btn-large halfway-fab red'>
            <i class='material-icons right'>delete_outline</i>
          </span>
        </base-card>
      </div>
    </template>
    <div class="new-question">
      <form @submit.prevent="addQuestion()">
        <label>Add Question</label>
        <input type="text" v-model="newQuestion">
      </form>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import db from '@/firebase/init.js'
import QuestionDuration from './QuestionDuration.vue'

export default {
  components: {
    QuestionDuration,
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  data () {
    return {
      allQuestions: false,
      newQuestion: null,
      loading: true,
    }
  },
  mounted () {
    this.$bind('allQuestions', db.collection('questions').where('fromPset', '==', this.$route.path))
    .then((doc) => {
      this.loading = false 
    })
    .catch((error) => {
      console.log('error in loading: ', error)
    })
  },
  methods: {
    addQuestion () {
      const questionID = this.$route.path + '/' + `${this.allQuestions.length + 1}`
      const ref = db.collection('questions')
      ref.add({
        content: this.newQuestion,
        fromPset: this.$route.path,
        questionID,
        feynmen: [{
          displayName: this.user.displayName,
          uid: this.user.uid,
          finished: false
        }]
      })
      this.newQuestion = null
    },
    deleteQuestion (id) {
      db.collection('questions').doc(id).delete()
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
        finished: false
      })
      await db.collection('questions').doc(id)
      .update({
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
      if (finishedClassmates.length == 0) {
        return 'Nobody has finished'
      } else if (finishedClassmates.length == 1) {
        return `${finishedClassmates.length} classmate finished` 
      } else {
        return `${finishedClassmates.length} classmates finished` 
      }
    },
    didUserSubmitATimeAlready ({ feynmen }) {
      var submitted = false 
      feynmen.forEach(f => {
        if (f.uid == this.user.uid) {
          submitted = f.submitted 
        } 
      })
      return submitted 
    }
  }
}
</script>

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
  width: 90%;
  margin: auto;
}

h2 {
  padding-bottom: 5%;
}

h5 {
  color: black;
}

.spinner-wrapper {
  margin-left: 49%;
}
</style>
