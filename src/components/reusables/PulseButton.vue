      
<template>
  <span @click="$emit('click')" class='btn-floating btn-large pink pulse'>
    <i class="material-icons">{{ iconName }}</i>
  </span>
</template>

<script>
export default {
  props: ['iconName']
}
</script>
  