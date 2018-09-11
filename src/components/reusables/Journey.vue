<template>
  <div class="flexbox">
    <doodle :allStrokes="journey.doodle" :scaleFactor="0.4" class="doodle"/>
    <message-history :messages="journey.messages" class="whiteboard"/>
  </div>
</template>

<script>
import MessageHistory from '@/components/reusables/MessageHistory.vue'
import Doodle from '@/components/reusables/Doodle.vue'

export default {
  props: ['journey'],
  components: {
    MessageHistory,
    Doodle 
  }
}
</script>

<style>
.flexbox {
  display: flex;
  justify-content: space-around;
  height: 380px;
}

.doodle {
  width: 40%;
}

.whiteboard {
  width: 40%;
  height: 600px;
}
</style>

