<template>
  <div class="collection">
    <template v-for="(journey, idx) in journeys">
      <router-link :to="'/conversation/' + journey.conversationID" 
                   class="collection-item" 
                   :key="idx">
        {{ journey.title }}
      </router-link>
    </template>
  </div>
</template>

<script>
export default {
  props: ['journeys']
}
</script>
