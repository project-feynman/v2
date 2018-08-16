<template>
  <div>
    <div v-if="!submitted" class="center duration-form">
      <p class="black-text">How many hours did it take?</p>
      <a @click="addTime($event)" class="waves-effect waves-light btn">0.5</a>
      <a @click="addTime($event)" class="waves-effect waves-light btn">1</a>
      <a @click="addTime($event)" class="waves-effect waves-light btn">1.5</a>
      <a @click="addTime($event)" class="waves-effect waves-light btn">2</a>
    </div>
    <span v-else class="green-text">
      Time submission recorded
    </span>
  </div>
</template>

<script>
import db from '@/firebase/init.js'

export default {
  // questionID is the question document ID 
  props: ['questionID', 'userUID'],
  data () {
    return {
      question: null,
      submitted: false,
    }
  },
  async mounted () {
    const ref = db.collection('questions').doc(this.questionID)
    var getDoc = ref.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!')
      } else {
        // now, try to determine whether the user has already submitted an answer or not 
        const feynmen = doc.data().feynmen 
        feynmen.forEach(f => {
          if (f.uid == this.userUID) {
            this.submitted = f.submitted 
          } 
        })
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    })
  },
  methods: {
    async addTime (event) {
      this.submitted = true 
      const ref = db.collection('questions').doc(this.questionID)
      ref.get().then(doc => {
        if (doc.exists) {
          const question = doc.data()
          // find user 
          var user = null 
          question.feynmen.forEach(f => {
            if (f.uid == this.userUID) {
              user = f 
            }
          })
          // compute new average 
          if (!user.submitted) {
            const newTime = parseFloat(event.target.innerText)
            var total = question.total 
            if (!total) {
              total = newTime 
            } else {
              total = total + newTime 
            }
            ref.update({
              total
            }).then(() => {
              // mark user as submitted 
              question.feynmen.forEach(f => {
                if (f.uid == user.uid) {
                  f.submitted = true 
                  f.submittedTime = newTime
                }
              })
              ref.update({
                feynmen: question.feynmen
              })
            })
          }
        } else {
          console.log('Document does not exist')
        }
      })
    }
  }
}
</script>

<style>
.duration-form {
  padding-bottom: 8%;
}
</style>
