<template>
  <div v-if="questions[0]">
    <template v-for="(group, idx) in chainReactionGroups">
      <chain-reaction :list-of-nodes="getParticipants(group)" :groupNumber="idx" :key="idx"></chain-reaction>
    </template>
  </div>
</template>

<script>
import firebase from 'firebase'
import ChainReaction from './ChainReaction.vue'
import db from '@/firebase/init.js'

export default {
  methods: {
    getParticipants (group) {
      return this.questions[0].feynmen.filter(f => f.chainReactionCreatorUID == group)
    }
  },
  components: {
    ChainReaction
  },
  computed: {
    participants () {
      return this.questions[0].feynmen.filter(f => f.teacher != null)
    },
    chainReactionGroups () {
      var groups = [] 
      this.questions[0].feynmen.forEach(f => {
        if (f.chainReactionCreatorUID) {
          if (!groups.includes(f.chainReactionCreatorUID)) {
            groups.push(f.chainReactionCreatorUID)
          }
        }
      })
      return groups 
    }
  },
  data () {
    return {
      loading: true,
      questions: []
    }
  },
  mounted () {
    this.$bind('questions', db.collection('questions').where('questionID', '==', this.$route.path))
      .then(doc => {
        this.loading = false
      }
    ).catch(error => {
      console.log('error from connecting to Firestore: ', error)
    })
  }
}
</script>
