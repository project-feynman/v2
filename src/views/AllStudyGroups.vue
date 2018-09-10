<template>
  <div>
    <h2 class="white-text center">{{ $route.params.subject_id }} Study Groups</h2>
    <p class="yellow-text center">{{ feedback }}</p>
    <div class="center">
      <pulse-button @click="createGroup()" iconName="add"></pulse-button> 
    </div>
    <template v-if="studyGroups">
      <div class="flexbox-container">
        <template v-for="(group, idx) in studyGroups">
          <div class="collection-list-wrapper" :key="idx">
            <collection-list :title="group.groupName" :listItems="flattenArrayOfObjects(group.participants)">
            </collection-list>
            <div class="flexbox-button-container center">
              <base-button @click="joinGroup(group)">Join</base-button>
              <base-button @click="leaveGroup(group)" buttonColor="yellow">Leave</base-button>
              <base-button @click="deleteGroup(group)" buttonColor="red">Delete</base-button>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import CollectionList from '@/components/reusables/CollectionList.vue'
import NewStudyGroup from '@/components/groups/NewStudyGroup.vue'
import PulseButton from '@/components/reusables/PulseButton.vue'
import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  components: {
    NewStudyGroup,
    CollectionList,
    PulseButton
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
      showForm: false,
      feedback: ''
    }
  },
  async created () {
    // obtain the study group from there
    const subject_id = this.$route.params.subject_id
    const ref = db.collection('studyGroups').where('forSubject', '==', subject_id)
    await this.$bind('studyGroups', ref)
  },
  methods: {
    async createGroup () {
      if (!this.isLoggedIn) {
        return 
      }
      this.feedback = 'Creating a new study group...'
      const subject_id = this.$route.params.subject_id
      // designate a chatroom for it (and the associated whiteboard)
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid 
      }
      const chatRef = db.collection('chatRooms')
      const result = await chatRef.add({
        messages: [],
        participants: [simplifiedUser],
        title: `${subject_id} Study Group`
      })
      const chatroomID = result.id 
      const whiteboardRef = db.collection('whiteboards').doc(chatroomID)
      await whiteboardRef.set({
        allPaths: []  
      })
      // create the study group document
      const ref = db.collection('studyGroups')
      const newGroup = {
        forSubject: subject_id,
        participants: [simplifiedUser],
        chatroomID
      }
      await ref.add(newGroup)
      // 3) store a reference to the group chat for the user 
      const userRef = db.collection('users').doc(this.user.uid) 
      const newSubject = {
        subjectID: subject_id,
        studyGroup: [simplifiedUser],
        chatroomID
      }
      await userRef.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayUnion(newSubject)
      })
      // quickfix 
      await userRef.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayRemove({subjectID: subject_id})
      })
      this.feedback = 'Successfully created a study group'
      setTimeout(() => this.feedback = '', 1000)
    },
    async joinGroup ({ id, chatroomID, forSubject, participants }) {
      const subject_id = this.$route.params.subject_id
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid,
      }
      const oldGroup = participants
      oldGroup.push(simplifiedUser)
      const newSubject = {
        subjectID: forSubject,
        participants: [], // have to update everywhere though 
        chatroomID
      }
      // 1) reference to group 
      const ref = db.collection('users').doc(this.user.uid)
      await ref.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayUnion(newSubject)
      })
      // quickfix 
      await ref.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayRemove({subjectID: subject_id})
      })
      // 2) update the participants of the chatroom 
      const chatRef = db.collection('chatRooms').doc(chatroomID)  
      await chatRef.update({
        participants: firebase.firestore.FieldValue.arrayUnion(simplifiedUser)
      })

    },
    async leaveGroup ({ id, chatroomID, participants, forSubject }) {
      const ref = db.collection('studyGroups').doc(id)
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid
      }
      await ref.update({
        participants: firebase.firestore.FieldValue.arrayRemove(simplifiedUser)
      })
      // update the user himself 
      const deleteObj = {
        chatroomID, 
        studyGroup: participants,
        subjectID: forSubject
      }
      const userRef = db.collection('users').doc(this.user.uid) 
      await userRef.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayRemove(deleteObj)
      })
    },
    async deleteGroup ({ id, chatroomID, participants, forSubject }) {
      const deleteObj = {
        chatroomID, 
        studyGroup: participants,
        subjectID: forSubject,
      }
      const userRef = db.collection('users').doc(this.user.uid)
      // update all users associated with the group 

      await userRef.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayRemove(deleteObj)
      })
      // now safely delete the user document 
      const ref = db.collection('studyGroups').doc(id) 
      await ref.delete()  
    },
    flattenArrayOfObjects (array) {
      var output = [] 
      array.forEach(elem => output.push(elem.displayName))
      return output 
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