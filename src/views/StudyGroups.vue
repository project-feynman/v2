<template>
  <div>
    <div class="fixed-action-btn">
      <pulse-button iconName="add" @click="createGroup()"></pulse-button>
    </div>
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
    <h2 class="white-text center">{{ $route.params.subject_id }} Study Groups</h2>
    <p class="yellow-text center">{{ feedback }}</p>
    <template v-if="studyGroups">
      <div class="flexbox-container">
        <template v-for="(group, idx) in studyGroups">
          <div class="collection-list-wrapper" :key="idx">
            <base-card>
              <h5 class="teal-text">{{ group.title }}</h5>
              <p class="teal-text">{{ group.participants.length }} classmates online</p>
              <floating-button iconName="input" 
                               color="green" 
                               tooltipText="Enter group chat"
                               @click="$router.push('/chat/' + group.id)"/>
              <template v-if="isOwner(group)">
                <floating-button iconName="mode_edit" 
                                 color="yellow darken-2" 
                                 tooltipText="Enter recruitment message"
                                 @click="editGroup(group)"/>
                <floating-button iconName="delete" 
                                 color="red" 
                                 tooltipText="Delete group" 
                                 @click="deleteGroup(group)"/>
              </template>
            </base-card>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import CollectionList from '@/components/reusables/CollectionList.vue'
import PulseButton from '@/components/reusables/PulseButton.vue'
import FloatingButton from '@/components/reusables/FloatingButton.vue'
import PopupModal from '@/components/reusables/PopupModal.vue'
import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  components: {
    CollectionList,
    PulseButton,
    FloatingButton,
    PopupModal 
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    isLoggedIn () {
      return this.user != 'undetermined' && this.user != null 
    }
  },
  data () {
    return {
      subject: {},
      studyGroups: [],
      feedback: '',
      showPopup: false,
      isEditting: false,
      editTitle: '',
      editID: ''
    }
  },
  async created () {
    // obtain the study group from there
    const subject_id = this.$route.params.subject_id
    const ref = db.collection('chatrooms').where('forSubject', '==', subject_id)
    await this.$bind('studyGroups', ref)
  },
  methods: {
    isOwner (group) {
      return this.user.uid == group.owner.uid 
    },
    async updateUser () {
      const ref = db.collection('users').doc(this.user.uid)
      await ref.update({
        firstTimeViewingGroups: false 
      })
    },
    async createGroup () {
      if (!this.isLoggedIn) {
        return 
      }
      this.feedback = 'Creating a new study group...'
      const subject_id = this.$route.params.subject_id
      const pset_number = this.$route.params.pset_number
      // designate a chatroom for it (and the associated whiteboard)
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid 
      }
      const chatRef = db.collection('chatrooms')
      const result = await chatRef.add({
        messages: [],
        participants: [simplifiedUser],
        topic: `Current discussion topic...`,
        forSubject: subject_id,
        psetNumber: pset_number,
        title: 'Working on question 1',
        owner: simplifiedUser
      })
      this.feedback = 'Initializing the whiteboard...'
      const chatroomID = result.id 
      const whiteboardRef = db.collection('whiteboards').doc(chatroomID)
      await whiteboardRef.set({
        allPaths: []  
      })
      // 3) store a reference to the group chat for the user 
      this.feedback = 'Adding you to the group chat...'
      const userRef = db.collection('users').doc(this.user.uid) 
      const newSubject = {
        subjectID: subject_id,
      }
      await userRef.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayUnion(newSubject)
      })
      this.feedback = 'Success'
      setTimeout(() => this.feedback = '', 500)
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
    async deleteGroup ({ id, forSubject }) {
      const ref = db.collection('chatrooms').doc(id) 
      await ref.delete()  
    }
  }
}
</script>

<style lang="scss" scoped>
.collection-list-wrapper {
  max-width: 30%;
  flex: 1 0 21%;
  margin: 5px;
  height: 100px;
}

.flexbox-container {
  display: flex;
  flex-wrap: wrap;
}

.flexbox-button-container {
  display: flex;
  margin: auto;
}
</style>