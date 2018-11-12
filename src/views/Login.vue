<template>
  <div>
    <h1 style="margin-bottom: 80px; margin-top: 100px;">Feynman Project (Beta)</h1>
    <p v-if="!hasFetchedUser" class="white-text center" style="font-size: 1.4em;">
      "If you cannot explain it simply, you don't understand it" - Richard Feynman
    </p>
    <div v-else>
      <template v-if="user">
        <div class="dashboard-button">
          <router-link to="/subjects">
            <pulse-button size="large" iconName="dashboard"/>
          </router-link>
        </div>
      </template>
      <template v-else>
        <div class="center">
          <base-button @click="signInAnonymously()">Login in Anonymously</base-button>
          <base-button buttonColor="pink" @click="signInWithPopup()">Login with Google</base-button>
        </div>
      </template>
    </div>
    <!-- <div style="display: flex; justify-content: space-evenly;"> -->
    <carousel>
      <doodle 
              slot="first"
              :allStrokes="showcase" 
              :widthPercentage="0.5"
              :heightPercentage="0.9">
      </doodle>
      <doodle 
              slot="second"
              :allStrokes="featureTwo" 
              :widthPercentage="0.5" 
              :heightPercentage="0.9">
      </doodle>
      <doodle 
              slot="third"
              :allStrokes="featureThree" 
              :widthPercentage="0.5" 
              :heightPercentage="0.9"></doodle>
    </carousel>
    <!-- </div> -->
 
    <!-- <carousel>     
      <doodle @new-scope="payload => handleScope(payload)" slot="first" :allStrokes="showcase" :small="true"></doodle>
      <doodle @new-scope="payload => handleScope(payload)" slot="third" :allStrokes="featureThree" :small="true"></doodle>
      <doodle @new-scope="payload => handleScope(payload)" slot="second" :allStrokes="featureTwo" :small="true"></doodle>
    </carousel> -->
  </div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/auth'
import db from '@/firebase/init.js'
import PulseButton from '@/components/reusables/PulseButton.vue'
import Doodle from '@/components/reusables/Doodle.vue'
import Carousel from '@/components/reusables/Carousel.vue'
import { mapState } from 'vuex'

export default {
	components: {
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
		...mapState({
			user: state => state.user.user,
			hasFetchedUser: state => state.user.hasFetchedUser
		})
	},
	async created() {
		const firstFeatureRef = db
			.collection('conversations')
			.where('title', '==', '1-2(c) Case 1')

		const secondFeatureRef = db
			.collection('conversations')
			.where('title', '==', '1-2(b) Case 2')

		const thirdRef = db
			.collection('conversations')
			.where('title', '==', 'Payoff Graph Part 3')

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
		},
		signInAnonymously() {
			firebase
				.auth()
				.signInAnonymously()
				.catch(function(error) {
					// Handle Errors here.
					console.log('error =', error)
					var errorCode = error.code
					var errorMessage = error.message
					// ...
				})
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
	@extend .center;
}

h1 {
	color: white;
}
</style>
