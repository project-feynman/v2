<template>
  <div>
    <div class="flexbox-container">
      <div class="journey-wrapper">
        <template v-if="true">
          <collection-list title="Recorded discussions"
                          :listItems="journeys"
                          @entire-click="journey => redirect(journey)"
                          actionIcon="delete"
                          @item-click="journey => processDeleteAttempt(journey)">
            <template slot-scope="{ item }">
              {{ item.title }}
            </template>
          </collection-list>
          <p v-if="feedback" class="yellow-text">{{ feedback }}</p>
        </template>
        <template v-else>
          <collection-list title="Recorded discussions"
                          :listItems="journeys"
                          @entire-click="journey => redirect(journey)"/>
          <p v-if="feedback" class="yellow-text">{{ feedback }}</p>
        </template>
      </div>
      <div class="classmates-wrapper">
        <classmates/>
      </div>
    </div>
    <feynmen/>
  </div>
</template>

<script>
import Classmates from './Classmates.vue'
import CollectionList from '@/components/reusables/CollectionList.vue'
import Feynmen from './Feynmen.vue'

export default {
  props: ['journeys', 'user'],
  components: {
    Classmates,
    CollectionList,
    Feynmen
  },
  data () {
    return {
      feedback: ''
    }
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
      const url = '/conversation/' + journey.conversationID
      this.$router.push(url)
    },
    processDeleteAttempt (journey) {
      if (this.createdByUser(journey)) {
        this.$emit('delete', journey)
      } else {
        this.feedback = "You cannot delete someone else's journey" 
        setTimeout(() => this.feedback = '', 2000)
      }
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
