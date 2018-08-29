<template>
  <ul>
    <li v-for="(journey, idx) in journeys" :key="idx">
      <router-link :to="'/conversation/' + journey.conversationID">
        {{ journey.title }}
      </router-link>
    </li>
  </ul>
</template>

<script>
export default {
  props: ['journeys']
}
</script>
