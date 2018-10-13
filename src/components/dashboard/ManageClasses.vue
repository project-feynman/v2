<template>
  <div>
    <template v-if="isLoggedIn">
      <popup-modal v-if="user.firstTimePickingClasses" @close="updateUser()">
        <p slot="header" class="teal-text center">
          Feynman is a place where you can find study groups spontaneously - by letting you find people
          in similar situations with similar needs. Get started by selecting your classes. 
        </p>
      </popup-modal>
    </template>
    <p v-if="feedback" class="yellow-text center">{{ feedback }}</p>
    <!-- This is the search form for the collection of classes -->
    <div style="width: 50%; margin: auto;">
      <search-box v-if="objectOfClasses"
        label="Find and add existing subject to dashboard" 
        :allResults="objectOfClasses"   
        @select="payload => addClass(payload)"/>
    </div>
    <div style="width: 50%; margin: auto;">
      <div class="row">
        <div class="col s12">
          <div class="row">
            <form @submit.prevent="addSubject()">
              <div class="input-field col s12">
                <i class="material-icons prefix">add</i>
                <input type="text" id="new-subject" v-model="newSubject">
                <label for="new-subject">Create new subject on Feynman</label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import firebase from 'firebase/app'
import 'firebase/firestore'
import SearchBox from '@/components/reusables/SearchBox.vue'
import PopupModal from '@/components/reusables/PopupModal.vue'
import PulseButton from '@/components/reusables/PulseButton.vue'

export default {
	components: {
		SearchBox,
		PopupModal,
		PulseButton
	},
	computed: {
		user() {
			return this.$store.state.user
		},
		isLoggedIn() {
			return this.user != 'undetermined' && this.user != null
		},
		objectOfClasses() {
			if (this.classes) {
				var output = {}
				this.classes.forEach(c => {
					output[c.id] = null
				})
				return output
			}
		}
	},
	data() {
		return {
			classes: [],
			hasFetchedClasses: false,
			feedback: '',
			newSubject: ''
		}
	},
	async created() {
		const ref = db.collection('subjects')
		// dead pointers

		await this.$bind('classes', ref)
	},
	methods: {
		async updateUser() {
			const ref = db.collection('users').doc(this.user.uid)
			await ref.update({
				firstTimePickingClasses: false
			})
		},
		async addClass(subjectNumber) {
			if (this.isLoggedIn) {
				console.log('addClass is executing')
				// user reference to the subject
				const ref = db.collection('users').doc(this.user.uid)
				await ref.update({
					enrolledSubjects: firebase.firestore.FieldValue.arrayUnion(
						subjectNumber
					)
				})
				// user reference to the user
				const subjectRef = db.collection('subjects').doc(subjectNumber)
				await subjectRef.update({
					enrolledUsers: firebase.firestore.FieldValue.arrayUnion(this.user.uid)
				})
				this.$emit('add-class')
			}
		},
		async resetClasses() {
			const ref = db.collection('users').doc(this.user.uid)
			await ref.update({
				enrolledSubjects: []
			})
		},
		async addSubject() {
			const newObject = {
				messages: [],
				numOnline: 0,
				numEnrolled: 0
			}
			const ref = db.collection('subjects').doc(this.newSubject)
			this.newSubject = ''
			await ref.set(newObject)
		}
	},
	watch: {
		isLoggedIn() {
			if (this.isLoggedIn) {
				if (!this.user.enrolledSubjects) {
					this.feedback =
						"Welcome - to get started, select classes you're taking this term"
				} else if (this.user.enrolledSubjects.length == 0) {
					this.feedback =
						"Welcome - to get started, select classes you're taking this term"
				}
			}
		}
	}
}
</script>

<style scoped lang="scss">
</style>

