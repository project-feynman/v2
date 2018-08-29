<template>
  <div>
    <h2 class="center white-text">Profile</h2>
    <ul class="center">
      <li># of Eurekas caused directly: 0</li>
      <li># of Eurekas caused indirectly: 0</li>
      <li>% Chance of causing Eureka: 100%</li>
    </ul>
    <profile-tree></profile-tree>
    <my-convos></my-convos>
  </div>
</template>

<script>
import ProfileTree from '@/components/profile/ProfileTree.vue'
import MyDoodles from '@/components/profile/MyDoodles.vue'
import MyConvos from '@/components/profile/MyConvos.vue'

export default {
  components: { 
    ProfileTree, 
    MyDoodles,
    MyConvos
  }
}
</script>
