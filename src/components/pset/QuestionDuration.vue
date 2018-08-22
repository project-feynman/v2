<template>
  <div>
    <div class="center duration-form">
      <p class="black-text">How many hours did it take?</p>
      <p class="black-text">{{ sliderHourValue }} hours</p>
      <form action="#">
        <p class="range-field">
          <input v-model="sliderHourValue" type="range" id="test5" min="0" max="12" />
        </p>
      </form>
      <a @click="addTime()" class="waves-effect waves-light btn">Submit</a>
    </div>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import noUiSlider from 'materialize-css/extras/noUiSlider/nouislider.js'

export default {
  // questionID is the question document ID 
  props: ['questionID', 'userUID'],
  data () {
    return {
      question: null,
      sliderHourValue: 6
    }
  },
  methods: {
    async addTime () {
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
          const newTime = parseFloat(this.sliderHourValue)
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
        } else {
          console.log('Document does not exist')
        }
      })
    }
  }
}
</script>

<style>
@import '/materialize-css/extras/noUiSlider/nouislider.css';

.duration-form {
  padding-bottom: 8%;
}
</style>
