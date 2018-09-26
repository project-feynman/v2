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
            <a id="dropdown-trigger" href="#!" data-target="dropdown">
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
    <ul id="dropdown" class="dropdown-content">
      <template v-if="chatrooms"
                v-for="(room, idx) in chatrooms">
        <div :key="idx">
          <li :key="idx">
            <a :href="`/chat/${room.id}`">{{ room.title }}          
              <span v-if="true" class="new badge">4</span>
            </a></li>
          <li class="divider"></li>
        </div>
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
        this.fetchChatDocs()
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
      hasSentPosition: false,
      chatrooms: []
    }
  },
  methods: {
    async fetchChatDocs () {
      const chats = this.user.chatrooms
      const n = chats.length 
      this.chatrooms = new Array(n).fill(0)
      for (var i=0; i<n; i++) {
        const ref = db.collection('chatrooms').doc(chats[i])
        const idx = i // necessary - snapShots persist after the function call, and it'll reference the final value of i (which is n)
        ref.onSnapshot(doc => {
          var data = doc.data()
          data.id = doc.id 
          this.$set(this.chatrooms, idx, data)
        })
      }
    },
    async signOut () {
      await this.$store.dispatch('logOut')
      this.$router.push('/')
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
