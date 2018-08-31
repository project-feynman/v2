<template>
  <div>
    <h1 class="center">Feynman Project</h1>
    <div class="spinner-wrapper">
      <base-spinner v-if="loading"></base-spinner>
    </div>
    <div id="firebaseui-auth-container"></div>
    <template v-if="user != 'undetermined' && user != null">
      <div class="dashboard-button center">
        <router-link to="/subjects">
          <a class="btn-floating pulse pink btn-large">
            <i class="material-icons">dashboard</i>
          </a>
        </router-link>
      </div>
    </template>
    <hr>
    <div class="showcase-container">
      <journey v-if="showcase != null" :journey="showcase"/>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import firebaseui from 'firebaseui'
import db from '@/firebase/init.js'
import Journey from '@/components/reusables/Journey.vue'

export default {
  components: {
    Journey
  },
  async created () {
    const ref = db.collection('conversations').doc('mfRdL2JDbkhhemLGlvs5')
    var doc = await ref.get()
    if (doc.exists) {
      this.showcase = doc.data() 
    }
  },
  data () {
    return {
      loading: true,
      showcase: null
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  watch: {
    user () {
      if (this.user == null) {
        this.loading = false 
        // sign up user to Firebase - register in Firestore immediately after redirect
        var ui = new firebaseui.auth.AuthUI(firebase.auth())
        ui.start('#firebaseui-auth-container', {
          signInSuccessUrl: '/subjects',
          signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID]
        })
      } else if (this.user.displayName) {
        this.loading = false 
        this.$router.push('/subjects')
      }
    }
  },
  mounted () {
    if (this.user != null && this.user != 'undetermined') {
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
p {
  @extend .black-text;
}

.showcase-container {
  margin: auto;
} 
</style>

<style scoped>
.light-card {
  padding: 20px;
}

.flex-container {
  display: flex;
  justify-content: space-evenly;
}

.dashboard-button {
  padding-top: 30px;
  padding-bottom: 30px;
}

h1 {
  color: white;
  padding-top: 50px;
  padding-bottom: 30px;
}

.subtitle {
  color: white;
}

hr {
  margin-top: 20px;
  margin-bottom: 50px;
}

.spinner-wrapper {
  margin-left: 49%;
}
</style>
