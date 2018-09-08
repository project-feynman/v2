<template>
  <div>
    <h2 class="white-text center">Study Groups</h2>
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
              <base-button @click="leaveGroup(group)" buttonColor="red">Leave</base-button>
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
      showForm: false
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
      const ref = db.collection('studyGroups')
      const subject_id = this.$route.params.subject_id
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid 
      }
      const newGroup = {
        forSubject: subject_id,
        participants: [simplifiedUser]
      }
      await ref.add(newGroup)
      console.log('Successfully added new study group')
    },
    async joinGroup ({ id }) {
      const ref = db.collection('studyGroups').doc(id)
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid
      }
      await ref.update({
        participants: firebase.firestore.FieldValue.arrayUnion(simplifiedUser)
      })
      // update the user 
    },
    async leaveGroup ({ id }) {
      const ref = db.collection('studyGroups').doc(id)
      const simplifiedUser = {
        displayName: this.user.displayName,
        uid: this.user.uid
      }
      await ref.update({
        participants: firebase.firestore.FieldValue.arrayRemove(simplifiedUser)
      })
      // update the user 
      // nest the document from within? Given a class and the user info, display his study group mates
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