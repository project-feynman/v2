<template>
  <div>
    <h2 class="white-text center">Class Directory</h2>
    <p v-if="feedback" class="yellow-text">{{ feedback }}</p>
    <h2 v-if="isLoggedIn">user = {{ user.enrolledSubjects }}</h2>
    <ul>
      <li v-for="(subject, idx) in classes" :key="idx">{{ subject }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  computed: {
    user () {
      return this.$store.state.user 
    },
    isLoggedIn () {
      return this.user != 'undetermined' && this.user != null 
    }
  },
  data () {
    return {
      classes: [],
      hasFetchedClasses: false,
      feedback: ''
    }
  },
  created () {
    if (this.isLoggedIn) {
      this.classes = this.user.classes 
      this.hasFetchedClasses = true 
    } else {
      this.feedabck = 'You are not logged in (somehow)'
    }
  },
  watch: {
    user () {
      if (this.isLoggedIn && !this.hasFetchedClasses) {
        this.classes = this.user.classes 
        this.hasFetchedClasses = true 
      }
    }
  }
}
</script>

