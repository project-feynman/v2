<template>
  <div>
    <h1>Feynman Project (Beta)</h1>
    <p class="center pink-text">(Beta is another way of saying - 'if something doesn't work, just refresh')</p>
    <p v-if="!hasFetchedUser" class="white-text center">Fetching your information...</p>
    <template v-if="hasFetchedUser">
      <template v-if="user != null">
        <div class="dashboard-button">
          <router-link to="/subjects">
            <pulse-button size="large" iconName="dashboard"/>
          </router-link>
        </div>
      </template>
      <template v-else>
        <div class="center">
          <base-button @click="signInWithPopup()">Login with Google</base-button>
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
import PulseButton from '@/components/reusables/PulseButton.vue'

export default {
  components: {
    Journey,
    PulseButton
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
      var provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithPopup(provider).then(result => {
        // Google Access Token - can use for Google API.
        // var token = result.credential.accessToken
      }).catch(error => console.log(error))
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
  @extend .center;
}

h1, h5 {
  @extend .center;
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
