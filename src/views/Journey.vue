<template>
  <div>
    <h2>{{ title }}</h2>
    <div class="center">
      <base-button buttonColor="pink" @click="redirectToGroup()">More explanations</base-button>
    </div>
    <h4 class="white-text center" v-if="isLoading">There is only one reason to be in college - to be able to learn with companions.</h4>
        <p class="white-text center" v-if="doodle.length == 0">Fetching chat log...</p>
        
        <!-- Chatlog -->
        <div class="messages-wrapper" style="width: 45%; margin: auto;">
          <message-history v-if="messages.length != 0" :messages="messages"/>
        </div>
        <p class="white-text center" v-if="doodle.length == 0">Fetching doodle...</p>
       
        <!-- Doodle -->
        <doodle :allStrokes="doodle"/>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import Doodle from '@/components/reusables/Doodle.vue'
import MessageHistory from '@/components/reusables/MessageHistory.vue'
import { mapState } from 'vuex'

export default {
	components: {
		Doodle,
		MessageHistory
	},
	computed: {
		...mapState(['user', 'hasFetchedUser'])
	},
	data() {
		return {
			title: '',
			doodle: [],
			messages: [],
			forGroup: '',
			hasFetchedConversation: false,
			isLoading: true
		}
	},
	watch: {
		hasFetchedUser: {
			handler: 'fetchConversation',
			immediate: true
		}
	},
	methods: {
		redirectToGroup() {
			if (this.forGroup) {
				this.$router.push(`/chat/${this.forGroup}`)
			}
		},
		async fetchConversation() {
			if (this.hasFetchedConversation || !this.hasFetchedUser) {
				return
			}
			// get document from firestore
			const id = this.$route.params.convo_id
			const ref = db.collection('conversations').doc(id)
			const doc = await ref.get()
			if (doc.exists) {
				const data = doc.data()
				this.doodle = data.doodle
				this.messages = data.messages
				this.title = data.title
				this.hasFetchedConversation = true
				this.forGroup = data.forGroup
				this.isLoading = false
			}
		}
	}
}
</script>

<style lang="scss" scoped>
h2 {
	@extend .center;
}

.flexbox-container {
	display: flex;
	justify-content: space-around;
}

.doodle-wrapper,
.doodle-wrapper {
	height: 600px;
}
</style>