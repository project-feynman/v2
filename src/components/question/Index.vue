<template>
  <div class="question">
    <h2 class="center">Question {{ $route.params.question_number }}</h2>
    <h3 v-if="question[0]" class="question-text center">
      {{ question[0].content }}
    </h3>
    <div class="row">
      <div class="col s12">
        <ul id="tabs" class="tabs">
          <li class="tab col s3"><a href="#test1" class="teal-text">Explanations</a></li>
          <li class="tab col s3"><a href="#test2" class="teal-text">Resources</a></li>
          <li class="tab col s3"><a href="#test3" class="teal-text">Classmates</a></li>
          <li class="tab col s3"><a href="#test4" class="teal-text">Chain Reaction</a></li>
        </ul>
      </div>
      <div id="test1" class="col s12 m12">
        <explanations/> 
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
import db from '@/firebase/init.js'
import Explanations from './Explanations.vue'
import Resources from './Resources.vue'
import Classmates from './Classmates.vue'
import ChainReaction from './ChainReaction.vue'
import Feynmen from './Feynmen.vue'

export default {
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
  padding-top: 60px;
}

.question-text {
  margin: auto;
  width: 80%;
  padding-bottom: 50px;
}

.flexbox-container {
  display: flex;
  justify-content: center;
}
</style>
