<template>
  <div>
    <!-- Tutorial popup -->
    <template v-if="isLoggedIn">
      <popup-modal v-if="user.firstTimeViewingGroups" @close="updateUser()">
        <p slot="header" class="teal-text center">
          Here, you can find groups of people who are working on the same part of the p-set as you are. 
          You can then view their past discussions, chat with them directly, or arrange to meet up. 
        </p>
      </popup-modal>
    </template>

    <!-- Edit study group name -->
    <template v-if="isEditting">
      <popup-modal @close="saveTitle()">
        <input slot="header" class="teal-text center" v-model="editTitle">
      </popup-modal>
    </template>

    <!-- Ask a question -->
    <popup-modal v-if="isAskingQuestion" @close="submitQuestion()" @dismiss="isAskingQuestion = false">
      <div class="row" slot="header">
        <form class="col s12">
          <div class="row">
            <div class="input-field col s12">
              <textarea id="textarea1" class="materialize-textarea" v-model="questionInput"></textarea>
              <label for="textarea1">Question</label>
            </div>
          </div>
        </form>
      </div>
    </popup-modal>

    <h2 class="white-text center" style="margin-top: 65px;">{{ $route.params.subject_id }}</h2>

    <div class="row">

      <!-- Classmates -->
      <div class="col s10 m2">
        <collection-list title="Classmates" 
                        :listItems="usersAvalibility">
          <template slot-scope="{ item }">
            {{ item.displayName }}
            <i v-if="item.isOnline" class="material-icons user-online secondary-content">fiber_manual_record</i>
          </template>
        </collection-list>
      </div>

      <!-- Questions -->
      <div class="col s10 m5">
        <ul class="collapsible">
          <li v-for="(question, index) in subject.questions" :key="index">
            <div class="collapsible-header black-text">
              <!-- <i class="material-icons">filter_drama</i> -->
                  <p class="black-text">{{ question.owner.displayName }} asks: {{ question.content }}</p>
            </div>
            <div class="collapsible-body"><span><div v-if="question.answerURL">
            <router-link :to="getPath(question.answerURL)">{{ question.answerURL }}</router-link>
          </div>
          <div v-else-if="hasFetchedUser">
            <template v-if="question.owner.uid != user.uid">
              <div style="display: flex; justify-content: space-evenly;">
                <input slot="header" class="teal-text center" placeholder="Answer with a journey URL" v-model="answerURL">
                <floating-button @click="answerQuestion(item)" iconName="send"></floating-button>
              </div>
            </template>
          </div></span></div>
          </li>
        </ul>
        <base-button @click="askQuestion">Ask A Question</base-button>
      </div>

      <!-- Lobby chat -->
      <div class="col s10 m5 offset-1">
        <chat-window :chatroom="subjectChat"></chat-window>
      </div>
    </div>
    
    <!-- Rooms -->
    <template v-if="studyGroups.length !== 0 && hasFetchedUser">
      <div class="responsive-grid" style="margin-top: 60px;">
        <template v-for="(group, idx) in studyGroups">
          <div class="collection-list-wrapper grid-item" :key="idx">
            <div class="card-wrapper">
              <base-card>
                <p class="teal-text card-info">{{ group.title }}</p>
                <p class="black-text card-info" style="margin-bottom: 25px;">
                  Created by {{ group.owner.displayName }} 
                </p>
                <floating-button iconName="slideshow" 
                                 color="green" 
                                 @click="$router.push('/chat/' + group.id)"/>
                <template v-if="isOwner(group)">
                  <floating-button iconName="mode_edit" 
                                   color="yellow darken-2" 
                                   @click="editGroup(group)"/>
                  <floating-button iconName="delete" 
                                   color="red" 
                                   @click="deleteGroup(group)"/>
                </template>
              </base-card>
            </div>
          </div>
        </template>
      </div>
    </template>
    <h4 v-else-if="!loadingGroups" class="center">
      There are no ongoing study sessions right now - start a new session by clicking the plus icon
    </h4>
    <!-- Add group button -->
    <div class="fixed-action-btn">
      <pulse-button iconName="add" @click="createGroup()"></pulse-button>
    </div>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import CollectionList from '@/components/reusables/CollectionList.vue'
import PulseButton from '@/components/reusables/PulseButton.vue'
import FloatingButton from '@/components/reusables/FloatingButton.vue'
import PopupModal from '@/components/reusables/PopupModal.vue'
import ChatWindow from '@/components/reusables/ChatWindow.vue'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { mapState } from 'vuex'

export default {
	components: {
		CollectionList,
		PulseButton,
		FloatingButton,
		PopupModal,
		ChatWindow
	},
	computed: {
		...mapState({
			user: state => state.user.user,
			hasFetchedUser: state => state.user.hasFetchedUser
		}),
		isLoggedIn() {
			return this.user && this.hasFetchedUser
		},
		usersAvalibility() {
			const activeUIDs = this.onlineClassmates.reduce((prev, obj) => {
				prev[obj.uid] = true
				return prev
			}, {})
			return this.enrolledStudents.map(user => {
				return {
					displayName: user.displayName,
					isOnline: activeUIDs[user.uid] ? true : false
				}
			})
		}
	},
	data() {
		return {
			subject: {},
			subjectChat: {},
			studyGroups: [],
			loadingGroups: true,
			showPopup: false,
			isEditting: false,
			isAskingQuestion: false,
			answerURL: '',
			editTitle: '',
			editID: '',
			enrolledStudents: [],
			onlineClassmates: [],
			questionInput: '',
			defaultTitles: [
				'Edit title here...',
				'Edit title here...',
				'Edit title here...'
			]
		}
	},
	async created() {
		const subject_id = this.$route.params.subject_id
		const subjectRef = db.collection('subjects').doc(subject_id)
		await this.$bind('subject', subjectRef).then(async sub => {
			if (!sub.subjectChatID) {
				const chatRef = db.collection('chatrooms')
				const result = await chatRef.add({
					messages: [],
					whoIsTyping: {},
					owner: {
						displayName: this.user.displayName,
						uid: this.user.uid
					}
				})
				subjectRef.update({
					subjectChatID: result.id
				})
				this.$bind('subjectChat', result)
			} else {
				const subjectChatRef = db.collection('chatrooms').doc(sub.subjectChatID)
				this.$bind('subjectChat', subjectChatRef)
			}
		})
		const ref = db.collection('chatrooms').where('forSubject', '==', subject_id)

		const studentsRef = db
			.collection('users')
			.where('enrolledSubjects', 'array-contains', subject_id)

		const onlineClassmates = db
			.collection('users')
			.where('enrolledSubjects', 'array-contains', subject_id)
			.where('isOnline', '==', true)

		await Promise.all([
			this.$bind('enrolledStudents', studentsRef),
			this.$bind('onlineClassmates', onlineClassmates),
			this.$bind('studyGroups', ref)
		])
		this.loadingGroups = false
	},
	mounted() {
		var elems = document.querySelectorAll('.collapsible')
		var instances = M.Collapsible.init(elems, {})
	},
	methods: {
		getPath(fullURL) {
			const el = document.createElement('a')
			el.href = fullURL
			return el.pathname
		},
		async answerQuestion(question) {
			const subjectRef = db.collection('subjects').doc(this.subject.id)
			const oldQuestion = question
			const newQuestion = question
			newQuestion.isAnswered = true
			newQuestion.answerURL = this.answerURL
			this.answerURL = ''
			await subjectRef.update({
				questions: firebase.firestore.FieldValue.arrayRemove(oldQuestion)
			})
			await subjectRef.update({
				questions: firebase.firestore.FieldValue.arrayUnion(newQuestion)
			})
		},
		submitJourneyURL(question) {
			return
		},
		askQuestion() {
			this.isAskingQuestion = true
			return
		},
		async submitQuestion() {
			this.isAskingQuestion = false
			const newQuestion = {
				content: this.questionInput,
				owner: {
					displayName: this.user.displayName,
					uid: this.user.uid
				},
				isAnswered: false
			}
			const subject_id = this.$route.params.subject_id
			const ref = db.collection('subjects').doc(subject_id)
			await ref.update({
				questions: firebase.firestore.FieldValue.arrayUnion(newQuestion)
			})
			this.questionInput = ''
		},
		isOwner(group) {
			return (
				this.user.uid == group.owner.uid || this.user.displayName == 'Elton Lin'
			)
		},
		async updateUser() {
			const ref = db.collection('users').doc(this.user.uid)
			await ref.update({
				firstTimeViewingGroups: false
			})
		},
		async newChatMessageChange(event) {
			if (!this.user.uid) {
				// early exit if user isn't loaded from db yet
				return
			}
			if (
				this.chatroom.whoIsTyping &&
				((event.target.value.length > 0 &&
					this.chatroom.whoIsTyping[this.user.uid]) ||
					(event.target.value.length === 0 &&
						!this.chatroom.whoIsTyping[this.user.uid]))
			) {
				// early exit condition so we don't have to query database everytime
				return
			}
			const roomID = this.$route.params.room_id
			const chatRoomRef = db.collection('chatrooms').doc(roomID)
			let chatRoom = await chatRoomRef.get()
			const whoIsTyping = chatRoom.data().whoIsTyping || {}
			event.target.value.length > 0
				? (whoIsTyping[this.user.uid] = this.user.displayName)
				: delete whoIsTyping[this.user.uid]
			chatRoomRef.update({
				whoIsTyping
			})
		},
		async createGroup() {
			if (!this.isLoggedIn) {
				return
			}
			const subject_id = this.$route.params.subject_id
			// designate a chatroom for it (and the associated whiteboard)
			const simplifiedUser = {
				displayName: this.user.displayName,
				uid: this.user.uid
			}
			const randomNumber =
				Math.floor(Math.random() * this.defaultTitles.length - 1) + 1
			const chosenTitle = this.defaultTitles[randomNumber]
			const chatRef = db.collection('chatrooms')
			const result = await chatRef.add({
				messages: [],
				whoIsTyping: {},
				participants: [simplifiedUser],
				forSubject: subject_id,
				title: chosenTitle,
				owner: simplifiedUser,
				whoIsTyping: {}
			})
			const chatroomID = result.id
			// add reference to the room for the user
			const userRef = db.collection('users').doc(this.user.uid)
			userRef.update({
				chatrooms: firebase.firestore.FieldValue.arrayUnion(chatroomID)
			})
			// setup whiteboard for the chatroom
			const whiteboardRef = db.collection('whiteboards').doc(chatroomID)
			await whiteboardRef.set({
				allPaths: []
			})
			this.feedback = 'Success'
			setTimeout(() => (this.feedback = ''), 500)
		},
		async editGroup(group) {
			this.isEditting = true
			this.editTitle = group.title
			this.editID = group.id
		},
		async saveTitle(group) {
			this.isEditting = false
			const ref = db.collection('chatrooms').doc(this.editID)
			await ref.update({
				title: this.editTitle
			})
			this.editTitle = ''
		},
		async deleteGroup({ id, forSubject }) {
			const ref = db.collection('chatrooms').doc(id)
			await ref.delete()
		}
	}
}
</script>

<style lang="scss" scoped>
.responsive-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	grid-gap: 15px;
	max-width: 90%;
	margin: 0 auto 30px;
}

.card-info {
	font-size: 0.7em;
}

.grid-item {
	border-radius: 5px;
	padding: 20px;
	font-size: 150%;
}

.user-online {
	font-size: 10px;
	color: #4aba34;
}
</style>