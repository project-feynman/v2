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
    <template v-if="isLoggedIn">
      <popup-modal v-if="newNotif" @close="markNotifAsRead()">
        <h4 slot="header" class="teal-text center">Someone is asking you a question</h4>
      </popup-modal>
    </template>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import PopupModal from '@/components/reusables/PopupModal.vue'

export default {
  components: {
    PopupModal
  },
  watch: {
    async user () {
      if (this.isLoggedIn) {
        // display notifications, if there are any 
        const notifs = this.user.notifications
        const latestNotif = notifs[notifs.length - 1]
        if (latestNotif.new) {
          this.newNotif = true 
        }
        // generate tokens if the user is new 
        console.log(`user = ${this.user}`)
        var fakeToken = 'fake_token'
        // if you are storing the token in the user document, then the ref wil be 
        const ref = db.collection('users').doc(this.user.uid)
        // you can do a update 
        await ref.update({
          token: fakeToken
        })
        // 
      }
    }
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
      newNotif: false
    }
  },
  methods: {
    async signOut () {
      await this.$store.dispatch('logOut')
      this.$router.push('/')
    },
    async markNotifAsRead () {
      const notifs = this.user.notifications
      const roomId = notifs[notifs.length - 1].roomId 
      this.$router.push(`/chat/${roomId}`) 
      this.newNotif = false 
      notifs[notifs.length - 1].new = false 
      const ref = db.collection('users').doc(this.user.uid)
      await ref.update({
        notifications: notifs 
      })
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
