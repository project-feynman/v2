<template>
  <div>
    <h1>Feynman Project (Beta)</h1>
    <carousel>  
      <doodle slot="first" :allStrokes="featureThree" strokeColor="red"></doodle>
      <doodle slot="second" :allStrokes="showcase" strokeColor="green"></doodle>
      <doodle slot="third" :allStrokes="featureTwo" strokeColor="purple"></doodle>
    </carousel>
    <p v-if="!hasFetchedUser" class="white-text center">Fetching your information...</p>
    <template v-if="hasFetchedUser">
      <template v-if="user">
        <div class="dashboard-button">
          <router-link to="/subjects">
            <pulse-button size="large" iconName="dashboard"/>
          </router-link>
        </div>
      </template>
      <template v-else>
        <div class="center">
          <base-button buttonColor="pink" @click="signInWithPopup()">Login with Google</base-button>
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
import Carousel from '@/components/reusables/Carousel.vue'
import { mapState } from 'vuex'

export default {
	components: {
		Journey,
		PulseButton,
		Doodle,
		Carousel
	},
	data() {
		return {
			showcase: [],
			featureTwo: [],
			featureThree: []
		}
	},
	computed: {
		...mapState(['user', 'hasFetchedUser'])
	},
	async created() {
		const firstFeatureRef = db
			.collection('conversations')
			.where('title', '==', 'Feature #1')

		const secondFeatureRef = db
			.collection('conversations')
			.where('title', '==', 'Feature #2')

		const thirdRef = db
			.collection('conversations')
			.where('title', '==', 'Feature #3 v3')

		const results = await Promise.all([
			firstFeatureRef.get(),
			secondFeatureRef.get(),
			thirdRef.get()
		])

		let dataOne = null
		let dataTwo = null
		let dataThree = null

		results[0].docs.forEach(doc => {
			dataOne = doc.data()
		})
		results[1].docs.forEach(doc => {
			dataTwo = doc.data()
		})
		results[2].docs.forEach(doc => {
			dataThree = doc.data()
		})
		this.showcase = dataOne.doodle
		this.featureTwo = dataTwo.doodle
		this.featureThree = dataThree.doodle
	},
	methods: {
		signInWithPopup() {
			let provider = new firebase.auth.GoogleAuthProvider()
			firebase
				.auth()
				.signInWithPopup(provider)
				.then(console.log('successfully logged in'))
				.catch(error => console.log(error))
		}
	}
}
</script>

<style lang="scss" scoped>
p {
	@extend .black-text;
}

.flex-container {
	display: flex;
	justify-content: space-evenly;
}

.dashboard-button {
	@extend .center;
}

h1 {
	padding-bottom: 30px;
	@extend .center;
}

h1 {
	color: white;
}
</style>
