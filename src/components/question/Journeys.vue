<template>
  <div class="collection">
    <template v-for="(journey, idx) in journeys">
      <router-link :to="'/conversation/' + journey.conversationID" 
                   class="collection-item" 
                   :key="idx">
        <h4>{{ journey.title }}</h4>
        <template v-if="createdByUser(journey)">
          <div class="delete-button-wrapper">
            <span @click="$emit('delete', journey)" class='btn-floating btn-small red right top'>
              <i class='material-icons delete-button'>delete_outline</i>
            </span>
          </div>
        </template>
      </router-link>
    </template>
  </div>
</template>

<script>
export default {
  props: ['journeys', 'user'],
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

.delete-button {
  z-index: 100;
}

.delete-button-wrapper {
  /* margin-bottom: 30px; */
  padding-top: 0;
  margin-top: 0;
  padding-bottom: 30px;
}
</style>
