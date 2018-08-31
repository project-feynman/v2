<template>
  <div class="flexbox-container">

          <!-- <template v-if="createdByUser(journey)">
            <div class="delete-button-wrapper">
              <span @click.stop="$emit('delete', journey)" class='btn-floating btn-small red right top'>
                <i class='material-icons delete-button'>delete_outline</i>
              </span>
            </div>
          </template> -->

    <div class="journey-wrapper">
      <!-- <template v-if="createdByUser(journey)"> -->
      <template v-if="true">
        <collection-list title="Recorded discussions"
                         :listItems="journeys"
                         itemName="title"
                         @entire-click="journey => redirect(journey)"
                         actionIcon="delete"
                         @item-click="journey => $emit('delete', journey)"/>
      </template>
      <template v-else>
        <collection-list title="Recorded discussions"
                        :listItems="journeys"
                        itemName="title"
                        @entire-click="journey => redirect(journey)"/>
      </template>
  
    </div>
    <div class="classmates-wrapper">
      <classmates/>
    </div>
  </div>
</template>

<script>
import Classmates from './Classmates.vue'
import CollectionList from '@/components/reusables/CollectionList.vue'

export default {
  props: ['journeys', 'user'],
  components: {
    Classmates,
    CollectionList
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
    },
    redirect (journey) {
      console.log(`journey = ${journey}`)
      const url = '/conversation/' + journey.conversationID
      this.$router.push(url)
    }
  }
}
</script>

<style lang="scss" scoped>

h4 {
  @extend .teal-text;
}

.journey-wrapper {
  width: 500px;
}

.flexbox-container {
  display: flex;
  justify-content: space-evenly;
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
