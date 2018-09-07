<template>
  <div>
    <h2 class="white-text center">All Study Groups For Subject</h2>
    <template v-if="subject && subject.studyGroups">
      <div class="flexbox-container">
        <template v-for="(group, idx) in subject.studyGroups">
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

export default {
  components: {
    CollectionList
  },
  data () {
    return {
      subject: {},
      studyGroups: [] 
    }
  },
  async created () {
    // obtain the study group from there
    const id = this.$route.params.subject_id
    const ref = db.collection('subjects').doc(id)
    await this.$bind('subject', ref)
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