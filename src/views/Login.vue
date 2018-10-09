<template>
  <div>
    <h1>Feynman Project (Beta)</h1>
    <div style="display: flex; justify-content: space-around;">
      <doodle :allStrokes="featureThree"></doodle>

      <doodle :allStrokes="showcase"></doodle>
            <doodle :allStrokes="featureTwo"></doodle>
    
 
    </div>
    <hr>
    <p v-if="!hasFetchedUser" class="white-text center">Fetching your information...</p>
    <template v-if="hasFetchedUser">
      <template v-if="user != null">
        <div class="dashboard-button">
          <router-link to="/subjects">
            <pulse-button size="large" iconName="dashboard"/>
          </router-link>
        </div>
      </template>
      <template v-else>
        <div class="center">
          <base-button @click="signInWithPopup()">Login with Google</base-button>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/auth'
import db from '@/firebase/init.js'
import Journey from '@/components/reusables/Journey.vue'
import PulseButton from '@/components/reusables/PulseButton.vue'
import Doodle from '@/components/reusables/Doodle.vue'

export default {
	components: {
		Journey,
		PulseButton,
		Doodle
	},
	data() {
		return {
			showcase: [],
			featureTwo: [],
			featureThree: []
		}
	},
	computed: {
		user() {
			return this.$store.state.user
		},
		hasFetchedUser() {
			return this.$store.state.hasFetchedUser
		}
	},
	async created() {
		// fetch document with where queries on the title - duh
		const firstFeatureRef = db
			.collection('conversations')
			.where('title', '==', 'Feature #1')
		const docs = await firstFeatureRef.get()
		let data = null
		this.showcase = docs.docs.forEach(doc => {
			data = doc.data()
		})
		let dataTwo = null
		const secondFeatureRef = db
			.collection('conversations')
			.where('title', '==', 'Feature #2')
		const docsTwo = await secondFeatureRef.get()
		this.featureTwo = docsTwo.docs.forEach(doc => {
			dataTwo = doc.data()
		})
		let dataThree = null
		const thirdRef = db
			.collection('conversations')
			.where('title', '==', 'Feature #3 v3')
		const docsThree = await thirdRef.get()
		this.featureThree = docsThree.docs.forEach(doc => {
			dataThree = doc.data()
		})
		this.showcase = data.doodle
		this.featureTwo = dataTwo.doodle
		this.featureThree = dataThree.doodle
	},
	methods: {
		signInWithPopup() {
			var provider = new firebase.auth.GoogleAuthProvider()
			firebase
				.auth()
				.signInWithPopup(provider)
				.then(result => console.log('successfully logged in'))
				.catch(error => console.log(error))
		}
	}
}
</script>

<style lang="scss" scoped>
p {
	@extend .black-text;
}

.showcase-container {
	margin: auto;
}

.light-card {
	padding: 20px;
}

.flex-container {
	display: flex;
	justify-content: space-evenly;
}

.dashboard-button {
	padding-top: 30px;
	padding-bottom: 30px;
	@extend .center;
}

h1,
h5 {
	@extend .center;
}

h1 {
	color: white;
	padding-top: 10px;
	padding-bottom: 30px;
}

.subtitle {
	color: white;
}

hr {
	margin-top: 20px;
	margin-bottom: 10px;
}

.spinner-wrapper {
	margin-left: 49%;
}
</style>
