<template>
  <div>
    <!-- Display all subjects enrolled -->
    <template v-if="isLoggedIn"> 
      <div class="collection-list-wrapper">
        <collection-list title="Classes" :listItems="user.enrolledSubjects"/>
    </div>
    </template> 
    <!-- Show what friends are doing -->
  </div>
</template>

<script>
import CollectionList from '@/components/reusables/CollectionList.vue'

export default {
  components: {
    CollectionList
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    isLoggedIn () {
      return this.user != 'undetermined' && this.user != null 
    }
  },
  async created () {
    
  },
}

</script>

<style scoped>
.collection-list-wrapper {
  width: 50%;
  margin: auto;
}
</style>