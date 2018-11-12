<template>
  <div>
    <nav>
      <div class="nav-wrapper grey lighten-5">
        <a v-show="!atHomePage" class="brand-logo">
          <router-link to="/">
            Feynman
          </router-link>
        </a>
        <ul class="right hide-on-med-and-down">
          <li v-show="isLoggedIn && user.chatrooms">
            <a id="dropdown-trigger" href="#!" data-target="dropdown">
              Chats
              <i class="material-icons right">chat</i>
            </a>
          </li>
          <template v-if="hasFetchedUser && user">
            <li v-if="user.displayName == 'Anonymous'">
              <base-button buttonColor="grey" textColor="white-text">
                Login
              </base-button>
            </li>
            <li v-else>
              <base-button @click="signOut()" buttonColor="grey" textColor="white-text">
                Logout
              </base-button>
            </li>
          </template>
        </ul>
      </div>
    </nav>
    <ul id="dropdown" class="dropdown-content">
      <template v-if="chatrooms.length != 0"
                v-for="(room, idx) in chatrooms">
        <div :key="idx">
          <li>
            <a :href="`/chat/${room.id}`">{{ room.title }}          
              <span v-if="true" class="new badge">1</span>
              <template v-if="room.messages">
                <p v-if="room.messages.length != 0"
                   class="teal-text">{{getLastMessage(room.messages)}}</p>
              </template>
            </a> 
          </li>
          <li class="divider"></li>
        </div>
      </template>
    </ul>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import PopupModal from '@/components/reusables/PopupModal.vue'
// import {
// 	getSubscription,
// 	sendSubscriptionToFirestore
// } from '@/api/push_notifications.js'
import { mapState } from 'vuex'

export default {
	components: {
		PopupModal
	},
	watch: {
		// use the "immediate" handler to handle the logic to clean the code
		async user() {
			if (this.isLoggedIn) {
				this.fetchChatDocs()
				// if (!this.hasFetchedToken) {
				// 	// generate tokens if the user is new
				// 	this.hasFetchedToken = true
				// 	sendSubscriptionToFirestore(this.user.uid)
				// 	var subscription = getSubscription()
				// 	if (subscription) {
				// 		const ref = db.collection('users').doc(this.user.uid)
				// 	}
				// }
			}
		},
		//
		hasFetchedUser() {
			if (!this.user && this.hasFetchedUser && !this.atHomePage) {
				firebase
					.auth()
					.signInAnonymously()
					.catch(error => console.log('error =', error))
			}
		}
	},
	mounted() {
		const elem = document.getElementById('dropdown-trigger')
		M.Dropdown.init(elem)
	},
	computed: {
		...mapState({
			user: state => state.user.user,
			hasFetchedUser: state => state.user.hasFetchedUser
		}),
		isLoggedIn() {
			return this.user && this.hasFetchedUser
		},
		atHomePage() {
			return this.$route.path == '/'
		}
	},
	data() {
		return {
			newNotif: false,
			hasFetchedToken: false,
			hasSentPosition: false,
			chatrooms: []
		}
	},
	methods: {
		async fetchChatDocs() {
			if (!this.user.chatrooms) {
				return
			}
			const chats = this.user.chatrooms
			const n = chats.length
			this.chatrooms = new Array(n).fill(0)
			for (var i = 0; i < n; i++) {
				const ref = db.collection('chatrooms').doc(chats[i])
				const idx = i // necessary - snapShots persist after the function call, and it'll reference the final value of i (which is n)
				ref.onSnapshot(doc => {
					if (!doc.exists) {
						this.removeEmptyPointer(chats[idx])
						return
					} else {
						let data = doc.data()
						data.id = doc.id
						this.$set(this.chatrooms, idx, data)
					}
				})
			}
		},
		async removeEmptyPointer(pointer) {
			const ref = db.collection('users').doc(this.user.uid)
			await ref.update({
				chatrooms: firebase.firestore.FieldValue.arrayRemove(pointer)
			})
		},
		async signOut() {
			await this.$store.dispatch('logOut')
			this.$router.push('/')
		},
		redirectToChat(roomID) {
			this.$router.push(`/chat/${roomID}`)
		},
		getLastMessage(messages) {
			return messages[messages.length - 1].content
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
