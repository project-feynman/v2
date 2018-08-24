<template>
  <div>
    <h2 class="center white-text">Profile</h2>
    <ul class="center">
      <li>Number of Eurekas caused directly: 0</li>
      <li>Number of Eurekas caused indirectly: 0</li>
      <li>% Chance of causing Eureka: 100%</li>
    </ul>
    <ProfileTree></ProfileTree>
  </div>
</template>

<script>
import ProfileTree from '@/components/profile/ProfileTree.vue'

export default {
  components: { ProfileTree },
}
</script>
