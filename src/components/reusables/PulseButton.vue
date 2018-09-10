      
<template>
  <span @click="$emit('click')" class='btn-floating btn-large pink pulse tooltipped' :data-tooltip="tooltipText">
    <i class="material-icons">{{ iconName }}</i>
  </span>
</template>

<script>
export default {
  props: ['iconName', 'tooltipText'],
  mounted () {
    if (this.tooltipText) {
      const elems = document.querySelectorAll('.tooltipped')
      var instances = M.Tooltip.init(elems)
    }
  }
}
</script>
  