<template>
  <div>
    <h2 class="white-text center">{{ $route.params.subject_id }} Study Groups</h2>
    <div class="center">
      <base-button @click="$router.push('/subjects')">Back to dashboard</base-button>
    </div>
    <p class="yellow-text center">{{ feedback }}</p>
    <div class="center">
      <pulse-button @click="createGroup()" iconName="add"></pulse-button> 
    </div>
    <template v-if="studyGroups">
      <div class="flexbox-container">
        <template v-for="(group, idx) in studyGroups">
          <div class="collection-list-wrapper" :key="idx">
            <base-card>
              <ul>
                <template v-for="(student, idx) in group.participants">
                  <li :key="idx" class="black-text">{{ student.displayName }}</li>
                </template>
              </ul>
              <div class="flexbox-button-container center">
                <base-button @click="joinGroup(group)">Join</base-button>
                <base-button @click="leaveGroup(group)" buttonColor="yellow">Leave</base-button>
                <base-button @click="deleteGroup(group)" buttonColor="red">Delete</base-button>
              </div>
            </base-card>
            <!-- potentially message individuals -->
            <!-- <collection-list :title="group.groupName" :listItems="flattenArrayOfObjects(group.participants)">
            </collection-list> -->
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
wq
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
    const ref = db.collection('chatRooms').where('forSubject', '==', subject_id)
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
        title: `${subject_id} Study Group`,
        forSubject: subject_id
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
        chatroomID
      }
      await userRef.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayUnion(newSubject)
      })
      // quickfix 
      await userRef.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayRemove({subjectID: subject_id})
      })
      this.feedback = 'Success'
      setTimeout(() => this.feedback = '', 500)
    },
    async joinGroup ({ id, forSubject, participants }) {
      const subject_id = this.$route.params.subject_id
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid,
      }
      const oldGroup = participants
      oldGroup.push(simplifiedUser)
      const newSubject = {
        subjectID: forSubject,
        chatroomID: id
      }
      // 1) user should have a reference to group 
      const ref = db.collection('users').doc(this.user.uid)
      await ref.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayUnion(newSubject)
      })
      await ref.update({ // quickfix
        enrolledSubjects: firebase.firestore.FieldValue.arrayRemove({subjectID: subject_id})
      })
      // 2) update the participants of the chatroom 
      const chatRef = db.collection('chatRooms').doc(id)  
      await chatRef.update({
        participants: firebase.firestore.FieldValue.arrayUnion(simplifiedUser)
      })
    },
    async leaveGroup ({ id, participants, forSubject }) {
      // update participants in the group document 
      const ref = db.collection('chatRooms').doc(id)
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid
      }
      await ref.update({
        participants: firebase.firestore.FieldValue.arrayRemove(simplifiedUser)
      })
      // update the user himself 
      const deleteObj = {
        chatroomID: id,
        subjectID: forSubject
      }
      const userRef = db.collection('users').doc(this.user.uid) 
      await userRef.update({
        enrolledSubjects: firebase.firestore.FieldValue.arrayRemove(deleteObj)
      })
    },
    async deleteGroup ({ id, participants, forSubject }) {
      const deleteObj = {
        chatroomID: id, 
        subjectID: forSubject,
      }
      participants.forEach(async person => {
        console.log('person =', person)
        const userRef = db.collection('users').doc(person.uid)
        await userRef.update({
          enrolledSubjects: firebase.firestore.FieldValue.arrayRemove(deleteObj)
        })
      })
      console.log('removed reference to the group for all participants')
      // now safely delete the study group document 
      const ref = db.collection('chatRooms').doc(id) 
      await ref.delete()  
    },
    // flattenArrayOfObjects (array) {
    //   var output = [] 
    //   array.forEach(elem => output.push(elem.displayName))
    //   return output 
    // }
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