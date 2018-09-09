<template>
  <div>
    <nav>
      <ul id="dropdown1" class="dropdown-content">
        <li>
          <router-link to="/subjects">Dashboard</router-link>
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
      <ul id="dropdown2" class="dropdown-content">
        <template v-if="isLoggedIn && user.enrolledSubjects">
          <li v-for="(subject, idx) in user.enrolledSubjects" :key="idx">
            <!-- there should be a chat ID associated with each group chat -->
            <router-link :to="'/chat/' + subject.chatroomID">
              {{ subject.subjectID }}'s Chat
            </router-link>
          </li>
        </template>
      </ul>
      <div class="nav-wrapper grey lighten-5">
        <a id="dropdown-trigger-1" 
            class="brand-logo" 
            href="#!" 
            data-target="dropdown1">
            <i class="material-icons right">menu</i>
          Menu
        </a>
        <ul class="right hide-on-med-and-down">
          <li>
            <a id="dropdown-trigger-2" 
              href="#!" 
              data-target="dropdown2">
              <i class="material-icons right">chat</i>
              Group Chats
            </a>
          </li>
          <template v-if="isLoggedIn">
            <!-- <li>
              <a href="https://github.com/Gustwalker/feynman-project/blob/master/README.md">
                About
              </a>
            </li> -->
            <li>
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
import { getToken, sendTokenToFirestore } from '@/push_notifications/push_notifications.js'

export default {
  components: {
    PopupModal
  },
  watch: {
    async user () {
      if (this.isLoggedIn && !this.hasFetchedToken) {
        this.hasFetchedToken = true 
        // display notifications, if there are any 
        const notifs = this.user.notifications
        const latestNotif = notifs[notifs.length - 1]
        if (latestNotif.new) {
          this.newNotif = true 
        }
        // generate tokens if the user is new 
				sendTokenToFirestore(this.user.uid)
        var token = await getToken()
	      console.log(token)
        if (token) {
          const ref = db.collection('users').doc(this.user.uid)
          await ref.update({
            token
          })
        }
      }
    }
  },
  mounted () {
    const elem1 = document.getElementById('dropdown-trigger-1')
    const elem2 = document.getElementById('dropdown-trigger-2')
    M.Dropdown.init(elem1)
    M.Dropdown.init(elem2)
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
      newNotif: false,
      hasFetchedToken: false
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
