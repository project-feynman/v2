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
    
    <!-- Input for creating a new subject on Feynman -->
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
import { mapState } from 'vuex'

export default {
	components: {
		SearchBox,
		PopupModal,
		PulseButton
	},
	computed: {
		...mapState(['user', 'hasFetchedUser']),
		isLoggedIn() {
			return this.user && this.hasFetchedUser
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
				// user reference to the subject
				const ref = db.collection('users').doc(this.user.uid)
				await ref.update({
					enrolledSubjects: firebase.firestore.FieldValue.arrayUnion(
						subjectNumber
					)
				})
				console.log('added subject to user')
				// user reference to the user
				const subjectRef = db.collection('subjects').doc(subjectNumber)
				await subjectRef.update({
					enrolledUsers: firebase.firestore.FieldValue.arrayUnion(this.user.uid)
				})
				this.$emit('add-class')
			}
		},
		async addSubject() {
			const chatRef = db.collection('chatrooms')
			const result = await chatRef.add({
				messages: [],
				whoIsTyping: {},
				// participants: [],
				// forSubject: subject_id,
				// psetNumber: pset_number,
				// title: chosenTitle,
				owner: {
					displayName: this.user.displayName,
					uid: this.user.uid
				}
			})
			const chatroomID = result.id
			const newSubject = {
				subjectNumber: this.newSubject,
				psets: [1],
				subjectChatID: chatroomID
			}
			const ref = db.collection('subjects').doc(this.newSubject)
			this.newSubject = ''
			await ref.set(newSubject)
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


