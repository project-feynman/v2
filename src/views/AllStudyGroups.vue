<template>
  <div>
    <new-study-group/>
    <h2 class="white-text center">Join Existing Groups</h2>
    <template v-if="studyGroups">
      <div class="flexbox-container">
        <template v-for="(group, idx) in studyGroups">
          <div class="collection-list-wrapper" :key="idx">
            <collection-list :title="group.groupName" :listItems="group.participants"></collection-list>
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

export default {
  components: {
    NewStudyGroup,
    CollectionList,
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
</style>