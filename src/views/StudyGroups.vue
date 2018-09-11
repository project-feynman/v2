<template>
  <div>
    <div class="center">
      <pulse-button @click="showPopup = true" iconName="warning" tooltipText="Help guide"></pulse-button>
    </div>
    <template v-if="isLoggedIn">
      <popup-modal v-if="showPopup" @close="showPopup = false">
        <p slot="header" class="teal-text center">
          Here, you can find groups of people who are working on the same part of the p-set as you are. 
          You can then view their past discussions, chat with them directly, or arrange to meet up. 
        </p>
      </popup-modal>
    </template>
    <h2 class="white-text center">{{ $route.params.subject_id }} Study Groups</h2>
    <p class="yellow-text center">{{ feedback }}</p>
    <div class="center">
      <base-button @click="createGroup()" iconName="add">Start a new group</base-button> 
    </div>
    <template v-if="studyGroups">
      <div class="flexbox-container">
        <template v-for="(group, idx) in studyGroups">
          <div class="collection-list-wrapper" :key="idx">
            <base-card>
              <h4 class="teal-text">{{ group.title }}</h4>
              <p class="teal-text">{{ group.description }}</p>
              <ul>
                <template v-for="(student, idx) in group.participants">
                  <li :key="idx" class="black-text">{{ student.displayName }}</li>
                </template>
              </ul>
              <pulse-button @click="enterChat(group)" iconName="input" tooltipText="Enter group chat"></pulse-button> 
              <base-button v-if="user.displayName == 'Elton Lin'" @click="deleteGroup(group)" buttonColor="red">Delete</base-button>
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
import NewStudyGroup from '@/components/groups/NewStudyGroup.vue'
import PulseButton from '@/components/reusables/PulseButton.vue'
import PopupModal from '@/components/reusables/PopupModal.vue'
import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  components: {
    NewStudyGroup,
    CollectionList,
    PulseButton,
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
      showForm: false,
      feedback: '',
      showPopup: false 
    }
  },
  async created () {
    // obtain the study group from there
    const subject_id = this.$route.params.subject_id
    const ref = db.collection('chatRooms').where('forSubject', '==', subject_id)
    await this.$bind('studyGroups', ref)
  },
  methods: {
    enterChat ({ id }) {
      this.$router.push('/chat/' + id)
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
      const chatRef = db.collection('chatRooms')
      const result = await chatRef.add({
        messages: [],
        participants: [simplifiedUser],
        title: `Current discussion topic...`,
        forSubject: subject_id,
        psetNumber: pset_number,
        description: 'Working on question 1'
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
    async deleteGroup ({ id, participants, forSubject }) {
      const deleteObj = {
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