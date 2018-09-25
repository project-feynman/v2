<template>
  <div>
    <nav>
      <div class="nav-wrapper grey lighten-5">
        <a v-show="isLoggedIn" class="brand-logo">
          <router-link to="/subjects">
            <i class="material-icons right">home</i>
            Feynman
          </router-link>
        </a>
        <ul class="right hide-on-med-and-down">
          <li v-show="isLoggedIn">
            <a id="dropdown-trigger" href="#!" data-target="dropdown1">
              Chat
              <i class="material-icons right">chat</i>
            </a>
          </li>
          <template v-if="isLoggedIn">
            <li>
              <base-button @click="signOut()" buttonColor="grey" textColor="white-text">
                Logout
              </base-button>
            </li>
          </template>
        </ul>
      </div>
    </nav>
    <!-- dropdown  -->
    <ul id="dropdown1" class="dropdown-content">
      <template v-if="user">
        <template v-if="user.chatrooms"
                  v-for="(room, idx) in user.chatrooms">
          <li :key="idx"><a :href="`/chat/${room}`">{{ room }}</a></li>
        </template>
      </template>
    </ul>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import PopupModal from '@/components/reusables/PopupModal.vue'
import { getSubscription, sendSubscriptionToFirestore } from '@/api/push_notifications.js'
import { getPermissionForGeolocation, sendPositionToFirestore } from '@/api/geolocation.js'

export default {
  components: {
    PopupModal
  },
  watch: {
    async user () {
      if (this.isLoggedIn) {
        // display notifications, if there are any 
        const notifs = this.user.notifications
        if (notifs) {
          if (notifs.length != 0) {
            const latestNotif = notifs[notifs.length - 1]
            if (latestNotif.new) {
              this.newNotif = true 
            }
          }
        }
        if (!this.hasFetchedToken) {
          // generate tokens if the user is new 
          this.hasFetchedToken = true 
          sendSubscriptionToFirestore(this.user.uid)
          var subscription = getSubscription()
          if (subscription) {
            const ref = db.collection('users').doc(this.user.uid)
          }
        }
        // UPDATE: don't store locations for current MVP 
				// getPermissionForGeolocation(position => { 
        //   if (this.hasSentPosition) {
        //     return 
        //   } 
				// 	sendPositionToFirestore(this.user.uid, 
				// 	{ 
				// 		accuracy: position.coords.accuracy,
				// 		longitude: position.coords.longitude,
				// 		latitude: position.coords.latitude,
				// 		timestamp: position.timestamp
        //   })
        //   this.hasSentPosition = true 
				// })
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
      newNotif: false,
      hasFetchedToken: false,
      hasSentPosition: false
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
    },
    redirectToChat (roomID) {
      this.$router.push(`/chat/${roomID}`)
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
