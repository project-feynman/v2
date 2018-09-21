<template>
  <div>
    <h1 class="center">Feynman Project (Beta)</h1>
    <p class="center pink-text">(Beta is another way of saying - 'if something doesn't work, just refresh')</p>
    <p v-if="loading" class="white-text center">Retrieving your information...</p>
    <div id="firebaseui-auth-container"></div>
    <template v-if="isLoggedIn">
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
import firebase from 'firebase/app'
import 'firebase/auth'
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
    },
    hasFetchedUser () {
      return this.$store.hasFetchedUser
    },
    isLoggedIn () {
      return this.user != 'undetermined' && this.user != null
    }
  },
  watch: {
    user () {
      if (!this.isLoggedIn) {
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
    if (this.isLoggedIn) {
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
