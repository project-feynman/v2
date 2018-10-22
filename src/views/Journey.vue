<template>
  <div>
    <h2>{{ title }}</h2>
    <div style="margin: auto; width: 90%;">
      <template v-if="!doodle">
         <p>Fetching doodle...</p>
      </template>
      <template v-else>
        <beta-doodle :allStrokes="doodle"/>
        <!-- <doodle :allStrokes="doodle"/> -->
      </template>
    </div>
    <div class="flexbox-container">
      <div class="messages-wrapper">
        <message-history v-if="messages" :messages="messages"/>
      </div>
    </div>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import Doodle from '@/components/reusables/Doodle.vue'
import BetaDoodle from '@/components/reusables/BetaDoodle.vue'
import MessageHistory from '@/components/reusables/MessageHistory.vue'
import { mapState } from 'vuex'

export default {
	components: {
		Doodle,
		BetaDoodle,
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
			hasFetchedConversation: false
		}
	},
	watch: {
		hasFetchedUser: {
			handler: 'fetchConversation',
			immediate: true
		}
	},
	methods: {
		async fetchConversation() {
			if (this.hasFetchedConversation) {
				return
			}
			if (!this.hasFetchedUser) {
				return
			}
			// get document from firestore
			const id = this.$route.params.convo_id
			const ref = db.collection('conversations').doc(id)
			const doc = await ref.get()
			if (doc.exists) {
				// display Doodle
				const data = doc.data()
				this.doodle = data.doodle
				this.messages = data.messages
				this.title = data.title
				this.hasFetchedConversation = true
			}
		}
	}
}
</script>

<style lang="scss" scoped>
canvas {
	position: absolute;
}

h2 {
	@extend .center;
}

.flexbox-container {
	display: flex;
	justify-content: space-around;
}

.doodle-wrapper,
.messages-wrapper {
	width: 45%;
}

.doodle-wrapper {
	height: 600px;
}
</style>