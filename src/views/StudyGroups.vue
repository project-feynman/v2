<template>
  <div>
    <chat-window :chatroom="subjectChat"></chat-window>
    <template v-if="isLoggedIn">
      <popup-modal v-if="user.firstTimeViewingGroups" @close="updateUser()">
        <p slot="header" class="teal-text center">
          Here, you can find groups of people who are working on the same part of the p-set as you are. 
          You can then view their past discussions, chat with them directly, or arrange to meet up. 
        </p>
      </popup-modal>
    </template>
    <template v-if="isEditting">
      <popup-modal @close="saveTitle()">
        <input slot="header" class="teal-text center" v-model="editTitle">
      </popup-modal>
    </template>
    <h2 class="white-text center" style="margin-top: 65px;">{{ $route.params.subject_id }}</h2>
    <collection-list :title="`${$route.params.subject_id} Classmates`" 
                     :listItems="usersAvalibility"
                     style="width: 20%; margin: auto;">
      <template slot-scope="{ item }">
        {{ item.displayName }}
        <i v-if="item.isOnline" class="material-icons user-online secondary-content">fiber_manual_record</i>
      </template>
    </collection-list>
    <template v-if="studyGroups.length !== 0">
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
    <template v-else-if="!loadingGroups">
      <h4 class="center">There are no ongoing study sessions right now - start a new session by clicking the plus icon</h4>
    </template>
    <div class="fixed-action-btn">
      <pulse-button iconName="add" @click="createGroup()"></pulse-button>
    </div>
  </div>
</template>

<script>
import db from "@/firebase/init.js";
import CollectionList from "@/components/reusables/CollectionList.vue";
import PulseButton from "@/components/reusables/PulseButton.vue";
import FloatingButton from "@/components/reusables/FloatingButton.vue";
import PopupModal from "@/components/reusables/PopupModal.vue";
import ChatWindow from "@/components/reusables/ChatWindow.vue";
import firebase from "firebase/app";
import "firebase/firestore";

export default {
<<<<<<< HEAD
	components: {
		CollectionList,
		PulseButton,
		FloatingButton,
		PopupModal,
		ChatWindow
	},
	computed: {
		user() {
			return this.$store.state.user
		},
		isLoggedIn() {
			return this.user != 'undetermined' && this.user != null
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
			studyGroups: [],
			loadingGroups: true,
			showPopup: false,
			isEditting: false,
			editTitle: '',
			editID: '',
			enrolledStudents: [],
			onlineClassmates: [],
			defaultTitles: [
				'Edit title here...',
				'e.g. Working on midterm',
				'e.g. Working on pset question 3'
			]
		}
	},
	async created() {
		const subject_id = this.$route.params.subject_id
		const ref = db.collection('chatrooms').where('forSubject', '==', subject_id)
		const studentsRef = db
			.collection('users')
			.where('enrolledSubjects', 'array-contains', subject_id)
		// .where('isOnline', '==', true)
		const onlineClassmates = db
			.collection('users')
			.where('enrolledSubjects', 'array-contains', subject_id)
			.where('isOnline', '==', true)
		Promise.all([
			this.$bind('enrolledStudents', studentsRef),
			this.$bind('onlineClassmates', onlineClassmates),
			this.$bind('studyGroups', ref)
		])
		// load the chat from the subject
		// const subjectRef = db.collection('subjects').doc(subject_id)
		// await this.$bind('subject', subjectRef)
		// console.log('subject messages =', this.subject.messages)
		this.loadingGroups = false
	},
	methods: {
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
=======
  components: {
    CollectionList,
    PulseButton,
    FloatingButton,
    PopupModal,
    ChatWindow
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    isLoggedIn() {
      return this.user != "undetermined" && this.user != null;
    },
    usersAvalibility() {
      const activeUIDs = this.onlineClassmates.reduce((prev, obj) => {
        prev[obj.uid] = true;
        return prev;
      }, {});
      return this.enrolledStudents.map(user => {
        return {
          displayName: user.displayName,
          isOnline: activeUIDs[user.uid] ? true : false
        };
      });
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
      editTitle: "",
      editID: "",
      enrolledStudents: [],
      onlineClassmates: [],
      defaultTitles: [
        "Edit title here...",
        "Edit title here...",
        "Edit title here..."
      ]
    };
  },
  async created() {
    const subject_id = this.$route.params.subject_id;
    const subjectRef = db.collection("subjects").doc(subject_id);
    await this.$bind("subject", subjectRef).then(async sub => {
      if (!sub.subjectChatID){
        const chatRef = db.collection("chatrooms");
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
          },
          whoIsTyping: {}
        });
        subjectRef.update({
          subjectChatID: result.id
        })
        this.$bind("subjectChat", result);        
      } else {
        const subjectChatRef = db.collection("chatrooms").doc(sub.subjectChatID);
        this.$bind("subjectChat", subjectChatRef);
      }
    });    
    const ref = db
      .collection("chatrooms")
      .where("forSubject", "==", subject_id);
    const studentsRef = db
      .collection("users")
      .where("enrolledSubjects", "array-contains", subject_id);
    // .where('isOnline', '==', true)
    const onlineClassmates = db
      .collection("users")
      .where("enrolledSubjects", "array-contains", subject_id)
      .where("isOnline", "==", true);
    await Promise.all([
      this.$bind("enrolledStudents", studentsRef),
      this.$bind("onlineClassmates", onlineClassmates),
      this.$bind("studyGroups", ref)
    ]);
    // load the chat from the subject
    // const subjectRef = db.collection('subjects').doc(subject_id)
    // await this.$bind('subject', subjectRef)
    // console.log('subject messages =', this.subject.messages)
    this.loadingGroups = false;
  },
  methods: {
    isOwner(group) {
      return (
        this.user.uid == group.owner.uid || this.user.displayName == "Elton Lin"
      );
    },
    async newChatMessageChange(event) {
      if (!this.user.uid) {
        // early exit if user isn't loaded from db yet
        return;
      }
      if (
        this.chatroom.whoIsTyping &&
        ((event.target.value.length > 0 &&
          this.chatroom.whoIsTyping[this.user.uid]) ||
          (event.target.value.length === 0 &&
            !this.chatroom.whoIsTyping[this.user.uid]))
      ) {
        // early exit condition so we don't have to query database everytime
        return;
      }
      const roomID = this.$route.params.room_id;
      const chatRoomRef = db.collection("chatrooms").doc(roomID);
      let chatRoom = await chatRoomRef.get();
      const whoIsTyping = chatRoom.data().whoIsTyping || {};
      event.target.value.length > 0
        ? (whoIsTyping[this.user.uid] = this.user.displayName)
        : delete whoIsTyping[this.user.uid];
      chatRoomRef.update({
        whoIsTyping
      });
    },
    async updateUser() {
      const ref = db.collection("users").doc(this.user.uid);
      await ref.update({
        firstTimeViewingGroups: false
      });
    },
    async createGroup() {
      if (!this.isLoggedIn) {
        return;
      }
      const subject_id = this.$route.params.subject_id;
      const pset_number = this.$route.params.pset_number;
      // designate a chatroom for it (and the associated whiteboard)
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid
      };
      const randomNumber =
        Math.floor(Math.random() * this.defaultTitles.length - 1) + 1;
      const chosenTitle = this.defaultTitles[randomNumber];
      const chatRef = db.collection("chatrooms");
      const result = await chatRef.add({
        messages: [],
        whoIsTyping: {},
        participants: [simplifiedUser],
        forSubject: subject_id,
        psetNumber: pset_number,
        title: chosenTitle,
        owner: simplifiedUser,
        whoIsTyping: {}
      });
      const chatroomID = result.id;
      const whiteboardRef = db.collection("whiteboards").doc(chatroomID);
      await whiteboardRef.set({
        allPaths: []
      });
      this.feedback = "Success";
      setTimeout(() => (this.feedback = ""), 500);
    },
    async editGroup(group) {
      this.isEditting = true;
      this.editTitle = group.title;
      this.editID = group.id;
    },
    async saveTitle(group) {
      this.isEditting = false;
      const ref = db.collection("chatrooms").doc(this.editID);
      await ref.update({
        title: this.editTitle
      });
      this.editTitle = "";
    },
    async deleteGroup({ id, forSubject }) {
      const ref = db.collection("chatrooms").doc(id);
      await ref.delete();
    }
  },
  beforeRouteLeave(to, from, next) {
    // remove user from whoIsTyping
    let chatRoomRef = db.collection('chatrooms').doc(this.subjectChat.id)
    const whoIsTyping = this.subjectChat.whoIsTyping
    delete whoIsTyping[this.user.uid]
    chatRoomRef.update({
      whoIsTyping
    })
    next()
  }
};
>>>>>>> a8814636bb8bdef47e37550100a0c641b66fa422
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