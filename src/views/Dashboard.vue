<template>
  <div>
    <div class="custom-offset"></div>
    <h2>Dashboard</h2>
    <p v-if="loading" class="white-text center">Fetching your classes...</p>
    <template v-if="betaSubjects.length && !loading && hasFetchedUser">
      <div class="responsive-grid">
          <template v-for="(subject, i) in betaSubjects">
            <div class="subject-card" :key="i">
              <base-card>
                <h4 class="black-text">{{ subject.id }}</h4>
                <p class="black-text">{{ subject.enrolledUsers.length }} enrolled </p>
                <!-- number of people online -->
                <p class="black-text">{{ numberOfOnlineClassmates(subject )}} online</p>
                <floating-button 
                              color="pink"
                              iconName="slideshow" 
                              @click="$router.push(subject.id)"/>
                <template v-if="user.displayName == 'Elton Lin'">
                  <floating-button 
                            iconName="delete" 
                            color="black" 
                            @click="deleteSubject(subject)"/>
                </template>
              </base-card>
            </div>
          </template>
      </div>
    </template>
    <manage-classes/>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import PulseButton from '@/components/reusables/PulseButton.vue'
import FloatingButton from '@/components/reusables/FloatingButton.vue'
import PopupModal from '@/components/reusables/PopupModal.vue'
import ManageClasses from '@/components/dashboard/ManageClasses.vue'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { mapState } from 'vuex'

export default {
	components: {
		PulseButton,
		FloatingButton,
		PopupModal,
		ManageClasses
	},
	computed: {
		...mapState(['user', 'hasFetchedUser']),
		setOfOnlineUIDs() {
			let arrayOfUIDs = []
			this.onlineUsers.forEach(user => arrayOfUIDs.push(user.id))
			return new Set(arrayOfUIDs)
		}
	},
	data() {
		return {
			subjects: [],
			loading: true,
			feedback: '',
			betaSubjects: [],
			onlineUsers: []
		}
	},
	watch: {
		// fetch subject cards when user initially enters / enrolls a subject / delete a subject
		user: {
			handler: 'fetchSubjects'
		}
	},
	created() {
		const onlineUsersRef = db.collection('users').where('isOnline', '==', true)
		this.$bind('onlineUsers', onlineUsersRef)
		if (this.hasFetchedUser) {
			this.fetchSubjects()
		}
	},
	methods: {
		async fetchSubjects() {
			if (!this.hasFetchedUser) {
				return
			}
			const enrolledSubjects = db
				.collection('subjects')
				.where('enrolledUsers', 'array-contains', this.user.uid)
			this.$bind('betaSubjects', enrolledSubjects)
			this.loading = false
		},
		async deleteSubject({ id }) {
			const ref = db.collection('users').doc(this.user.uid)
			// remove user's reference
			await ref.update({
				enrolledSubjects: firebase.firestore.FieldValue.arrayRemove(id)
			})
			// remove subject's reference
			const subjectRef = db.collection('subjects').doc(id)
			await subjectRef.update({
				enrolledUsers: firebase.firestore.FieldValue.arrayRemove(this.user.uid)
			})
		},
		numberOfOnlineClassmates({ enrolledUsers }) {
			const enrolledUIDs = enrolledUsers
			const onlineUIDs = this.setOfOnlineUIDs
			const enrolledAndOnline = new Set(
				[...enrolledUIDs].filter(UID => onlineUIDs.has(UID))
			)
			return enrolledAndOnline.size
		}
	}
}
</script>


<style lang="scss" scoped>
.responsive-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 0.97fr));
	grid-gap: 30px;
	max-width: 90%;
	margin: 0 auto 30px;
}

h2 {
	@extend .center;
	padding-bottom: 50px;
}

h4 {
	@extend .black-text;
}

.custom-offset {
	padding-top: 30px;
}

.new-subject {
	margin: auto;
	width: 65%;
}

.spinner-wrapper {
	margin-left: 49%;
}
</style>




