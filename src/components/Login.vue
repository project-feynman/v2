<template>
  <div>
    <h1 class="center">The Feynman Project</h1>
    <div v-if="user" class="center dashboard-button">
      <router-link to="/subjects">
        <a class="btn-floating pulse pink btn-large">
          <i class="material-icons">dashboard</i>
        </a>
      </router-link>
    </div>
    <div v-else id="firebaseui-auth-container"></div>
    <hr>
    <div class="container">
      <div class="row">
        <div class="col s12 m4">
          <div class="card light-card">
            <p class="black-text">
              “Oh no!” says Claire. She has just sat through an entire lecture and managed to understand nothing! “The lecture was actually really interesting…” her friends say, with smiles that make her want to mush their heads into a pillow. They try explaining it to her, but now she’s even more confused.
            </p>
            <div class="center">
            <a slot="action" class="btn-floating tooltipped btn-large black center" data-tooltip="View the best student explanations for the hardest concepts">
              <i class="material-icons">video_library</i>
            </a>
          </div>
          </div>
        </div>

        <div class="col s12 m4">
          <div class="card light-card">
            <p class="black-text">Bob is having trouble on his pset, so he goes to office hours. The help queue is longer than any part of his anatomy. He messages his friends on Facebook, but all of them say they’re “already done” or “haven't started yet lol.” Should Bob commit murder?</p>
              <div class="center">
                <a slot="action" class="btn-floating tooltipped btn-large black" data-tooltip="Talk to classmates who're online and completed the question you're on">
                  <i class="material-icons">people_outline</i>
                </a>
              </div>
          </div>
        </div>

        <div class="col s12 m4">
          <div class="card light-card">
            <p class="black-text">The staff notifies everyone that there'd been a mistake with the test cases they provided. Everybody hears about it, besides Jim, who's a bit of a zoned-out legend. He wastes an hour wondering what's wrong with his code. Don't be Jim.</p>
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
  async mounted () {
    const elems = document.querySelectorAll('.tooltipped')
    var instances = M.Tooltip.init(elems, {})
    // sign up user to Firebase - register in Firestore immediately after redirect
    if (!this.user) {
      var ui = new firebaseui.auth.AuthUI(firebase.auth())
      ui.start('#firebaseui-auth-container', {
        signInSuccessUrl: '/subjects',
        signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID]
      })
    }
  }
}
</script>

<style scoped>
.light-card {
  padding: 20px;
}

.card-wrapper {
  width: 50%;
}

/* quickfix */
.tooltipped {
  margin-top: 20px;
  margin-bottom: 5px;
}

.flex-container {
  display: flex;
  justify-content: space-around;
}

.information {
  width: 33%;
  margin: 20px;
  flex-grow: 1;
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
