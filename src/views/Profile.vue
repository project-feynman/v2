<template>
  <div>
    <h2 class="center white-text">Profile</h2>
    <ul class="center">
      <li>Number of Eurekas caused directly: 0</li>
      <li>Number of Eurekas caused indirectly: 0</li>
      <li>% Chance of causing Eureka: 100%</li>
    </ul>
    <profile-tree></profile-tree>
    <my-doodles></my-doodles>
  </div>
</template>

<script>
import ProfileTree from '@/components/profile/ProfileTree.vue'
import MyDoodles from '@/components/profile/MyDoodles.vue'

export default {
  components: { 
    ProfileTree, 
    MyDoodles
  }
}
</script>
