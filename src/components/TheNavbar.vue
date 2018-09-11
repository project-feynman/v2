<template>
  <div>
    <nav>
      <ul id="dropdown1" class="dropdown-content">
        <template v-if="isLoggedIn">
          <li>
            <router-link to="/subjects">Dashboard</router-link>
          </li>
          <!-- <li v-if="user.recentPsetID">
            <router-link :to="user.recentPsetID">
              Pset
            </router-link>
          </li> -->
          <!-- <li v-if="user.recentQuestionID">
            <router-link :to="user.recentQuestionID">
              Recent Question
            </router-link>
          </li> -->
          <li v-if="user.recentChatID">
            <router-link :to="`/chat/${user.recentChatID}`">
              Resume Chat
            </router-link>
          </li>
        </template>
      </ul>
      <!-- <ul id="dropdown2" class="dropdown-content">
        <template v-if="isLoggedIn && user.enrolledSubjects">
          <li v-if="user.enrolledSubjects.length == 0">You haven't joined a study group yet</li>
          <template v-else v-for="(subject, idx) in user.enrolledSubjects"> 
            <li v-if="subject.chatroomID" :key="idx">
              <router-link :to="'/chat/' + subject.chatroomID">
                {{ subject.subjectID }}'s Chat
              </router-link>
            </li>
          </template>
        </template>
      </ul> -->
      <div class="nav-wrapper grey lighten-5">
        <template v-show="isLoggedIn == true">
        <a id="dropdown-trigger-1" 
            class="brand-logo" 
            href="#!" 
            data-target="dropdown1">
            <i class="material-icons right">menu</i>
          Menu
        </a>
        </template>
        <ul class="right hide-on-med-and-down">
          <!-- <template v-show="isLoggedIn == true">
            <li>
              <a id="dropdown-trigger-2" 
                href="#!" 
                data-target="dropdown2">
                <i class="material-icons right">chat</i>
                Group Chats
              </a>
            </li>
          </template> -->
          <template v-if="isLoggedIn">
            <li>
              <a href="https://github.com/Gustwalker/feynman-project/blob/master/README.md">
                About
              </a>
            </li>
            <!-- <li>
              <router-link class="black-text" to="/profile">
                Hi, Feynman #{{ user.feynmanNumber }}
              </router-link>
            </li> -->
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
import { getToken, sendTokenToFirestore } from '@/api/push_notifications.js'
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
          sendTokenToFirestore(this.user.uid)
          var token = await getToken()
          if (token) {
            const ref = db.collection('users').doc(this.user.uid)
            await ref.update({
              token
            })
          }
        }
				//sending the current location to Firestore
				getPermissionForGeolocation((position) => { 
					sendPositionToFirestore(this.user.uid, 
					{ 
						accuracy: position.coords.accuracy,
						longitude: position.coords.longitude,
						latitude: position.coords.latitude,
						timestamp: position.timestamp
					})
				})
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
