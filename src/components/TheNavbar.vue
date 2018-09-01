<template>
<div>
  <nav>
    <ul id="dropdown1" class="dropdown-content">
      <li>
        <router-link to="/subjects">Subjects</router-link>
      </li>
      <template v-if="isLoggedIn">
        <li v-if="user.recentPsetID">
          <router-link :to="user.recentPsetID">
            Pset
          </router-link>
        </li>
        <li v-if="user.recentQuestionID">
          <router-link :to="user.recentQuestionID">
            Question
          </router-link>
        </li>
        <li v-if="user.recentChatID">
          <router-link :to="`/chat/${user.recentChatID}`">
            Chat
          </router-link>
        </li>
      </template>
    </ul>
    <div class="nav-wrapper grey lighten-5">
      <router-link to="/">
        <a class="brand-logo"><i class="material-icons">home</i>Home</a>
      </router-link>
      <ul class="right hide-on-med-and-down">
        <li>
          <a id="dropdown-trigger" 
             class="dropdown-trigger" 
             href="#!" 
             data-target="dropdown1">
            Resume<i class="material-icons right">arrow_drop_down</i></a>
        </li>
        <template v-if="isLoggedIn">
          <li>
            <a href="https://github.com/Gustwalker/feynman-project/blob/master/README.md">
              About
            </a>
          </li>
          <li v-if="user">
            <router-link class="black-text" to="/profile">
              <!-- <i class="material-icons left">person_pin</i> -->
              Hi, Feynman #{{ user.feynmanNumber }}
            </router-link>
          </li>
          <li>
            <base-button @click="signOut()" buttonColor="grey" textColor="white-text">
              Logout
            </base-button>
          </li>
        </template>
      </ul>
    </div>
  </nav>
  <popup-modal v-if="newNotif" @close="newNotif = false"/>
</div>
</template>

<script>
import firebase from 'firebase'
import db from '@/firebase/init.js'
import PopupModal from '@/components/reusables/PopupModal.vue'

export default {
  components: {
    PopupModal
  },
  mounted () {
    const elem = document.getElementById('dropdown-trigger')
    M.Dropdown.init(elem)
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    isLoggedIn () {
      return this.user != null && this.user != 'undetermined'
    }
  },
  data () {
    return {
      newNotif: true
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

<style lang="scss" scoped>
a {
  @extend .black-text;
}
</style>

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
