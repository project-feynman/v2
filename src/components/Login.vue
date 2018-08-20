<template>
  <div>
    <h1 class="center">The Feynman Project</h1>
    <div id="firebaseui-auth-container"></div>
    <template v-if="user != 'undetermined'">
      <div v-if="user" class="center dashboard-button">
        <router-link to="/subjects">
          <a class="btn-floating pulse pink btn-large">
            <i class="material-icons">dashboard</i>
          </a>
        </router-link>
      </div>
    </template>
    <hr>
    <div class="container">
      <div class="row">
        <div class="col s12 m4">
          <div class="card light-card">
            <p class="black-text">
              View explanations created by previous students. Ask questions to classmates who are currently
              on the same question as you
            </p>
            <div class="center">
            <a slot="action" class="btn-floating tooltipped btn-large black center" data-tooltip="View the best student explanations for the hardest concepts">
              <i class="material-icons">video_library</i>
            </a>
          </div>
        </div>
      </div>
      <div class="col s12 m4 add-padding">
        <div class="card light-card">
          <p class="black-text">
            When you get an Eureka moment, get ready to explain the concept to two other classmates anonymously
          </p>
            <div class="center">
              <a slot="action" class="btn-floating tooltipped btn-large black" data-tooltip="Talk to classmates who're online and completed the question you're on">
                <i class="material-icons">people_outline</i>
              </a>
            </div>
        </div>
      </div>
        <div class="col s12 m4">
          <div class="card light-card">
            <p class="black-text">Later, all names will be revealed, and the visualization of the "chain-reaction" you've started will be available</p>
              <div class="center">
                <a slot="action" class="btn-floating tooltipped btn-large black center" data-tooltip="Get info from Stellar, Piazza...in one place">
                  <i class="material-icons">info</i>
                </a>
              </div>
          </div>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import firebase from 'firebase'
import firebaseui from 'firebaseui'
import db from '@/firebase/init.js'

export default {
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  watch: {
    user () {
      if (this.user == null) {
        // sign up user to Firebase - register in Firestore immediately after redirect
        var ui = new firebaseui.auth.AuthUI(firebase.auth())
        ui.start('#firebaseui-auth-container', {
          signInSuccessUrl: '/subjects',
          signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID]
        })
      } else if (this.user.displayName) {
        this.$router.push('/subjects')
      }
    }
  },
  async mounted () {
    const elems = document.querySelectorAll('.tooltipped')
    var instances = M.Tooltip.init(elems, {})
  }
}
</script>

<style scoped>
.light-card {
  padding: 20px;
}

/* quickfix */
.tooltipped {
  margin-top: 20px;
  margin-bottom: 5px;
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
</style>
