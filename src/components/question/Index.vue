<template>
  <div class="question">
    <div class="custom-offset"></div>
    <h2 class="center">Question {{ $route.params.question_number }}</h2>
    <template v-if="question[0]">
      <h3 class="question-text center">{{ question[0].content }}</h3>
    </template>
    <explanations/> 
    <resources/> 
    <classmates/>
    <feynmen></feynmen>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import Explanations from './Explanations.vue'
import Resources from './Resources.vue'
import Classmates from './Classmates.vue'
import ChainReaction from './ChainReaction.vue'
import Feynmen from './Feynmen.vue'

export default {
  components: {
    Explanations,
    Classmates,
    Resources,
    ChainReaction,
    Feynmen
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
  }
}
</script>

<style scoped>
.custom-offset {
  padding-top: 80px;
}

.question-text {
  margin: auto;
  width: 80%;
  padding-bottom: 50px;
}
</style>
