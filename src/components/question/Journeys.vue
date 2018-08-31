<template>
  <div class="flexbox-container">
    <div class="collection with-header journey-collection">
      <li class="collection-header">
        <h4>Recorded Journeys</h4>
      </li>
      <template v-for="(journey, idx) in journeys">
        <router-link :to="'/conversation/' + journey.conversationID" 
                     class="collection-item"
                     :key="idx">
          <h6>{{ journey.title }}</h6>
          <template v-if="createdByUser(journey)">
            <div class="delete-button-wrapper">
              <span @click.stop="$emit('delete', journey)" class='btn-floating btn-small red right top'>
                <i class='material-icons delete-button'>delete_outline</i>
              </span>
            </div>
          </template>
        </router-link>
      </template>
    </div>
    <div class="classmates-wrapper">
      <classmates/>
    </div>
  </div>
</template>

<script>
import Classmates from './Classmates.vue'

export default {
  props: ['journeys', 'user'],
  components: {
    Classmates
  },
  methods: {
    createdByUser ({ participants }) {
      var output = false 
      participants.forEach(participant => {
        if (participant.uid == this.user.uid) {
          output = true 
        }
      })
      return output 
    }
  }
}
</script>

<style lang="scss" scoped>

h4 {
  @extend .teal-text;
}

.flexbox-container {
  display: flex;
}

.classmates-wrapper {
  width: 500px;
}

.journey-collection {
  width: 80%;
  margin: auto;
}

.delete-button-wrapper {
  padding-bottom: 30px;
}
</style>
