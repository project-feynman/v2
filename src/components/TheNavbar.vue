<template>
  <nav>
    <div class="nav-wrapper grey lighten-5">
      <router-link to="/">
        <a class="brand-logo black-text"><i class="material-icons">home</i>Home</a>
      </router-link>
      <ul class="right hide-on-med-and-down">
        <template v-if="user != null && user != 'undetermined'">
          <li><a href="https://github.com/Gustwalker/Feynman" class="black-text">About</a></li>
          <li v-if="user.recentChatID"><router-link class="black-text" :to="`/chat/${user.recentChatID}`">Resume Chat</router-link></li>
          <li v-if="user">
            <router-link class="black-text" to="/profile">
              <!-- <i class="material-icons left">person_pin</i> -->
              Hi, Feynman #{{ user.feynmanNumber }}
            </router-link>
          </li>
          <li><base-button @click="signOut()" buttonColor="grey" textColor="white-text">Logout</base-button></li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script>
import firebase from 'firebase'
import db from '@/firebase/init.js'

export default {
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  methods: {
    async signOut () {
      await this.$store.dispatch('logOut')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
a {
  color: white;
}

li {
  color: white;
}

.brand-logo {
  margin-left: 10px;
}
</style>
