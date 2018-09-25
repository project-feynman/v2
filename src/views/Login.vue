<template>
  <div>
    <h1 class="center">Feynman Project (Beta)</h1>
    <h5 class="center">A conspiracy to bring visual explanations to every subject in the world...</h5>
    <h5 class="center">by giving every student a study group and a magic whiteboard</h5>
    <p class="center pink-text">(Beta is another way of saying - 'if something doesn't work, just refresh')</p>
    <p v-if="!hasFetchedUser" class="white-text center">Fetching your information...</p>
    <template v-if="hasFetchedUser">
      <template v-if="user != null">
        <div class="dashboard-button center">
          <router-link to="/subjects">
            <a class="btn-floating pulse pink btn-large">
              <i class="material-icons">dashboard</i>
            </a>
          </router-link>
        </div>
      </template>
      <template v-else>
        <div class="center">
          <base-button style="margin: auto;" @click="signInWithPopup()">Login with Google</base-button>
        </div>
      </template>
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
  methods: {
    signInWithPopup() {
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(result => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
      }).catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
      })
    }
  },
  data () {
    return {
      showcase: null
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    hasFetchedUser () {
      return this.$store.state.hasFetchedUser
    }
  },
  watch: {
    user () {
      if (this.hasFetchedUser && this.user != null) {
        this.$router.push('/subjects')
      }
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
