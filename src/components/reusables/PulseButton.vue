      
<template>
  <span @click="handleClick()" ref="tooltipped-button" class='btn-floating btn-large pink pulse tooltipped' :data-tooltip="tooltipText">
    <i class="material-icons">{{ iconName }}</i>
  </span>
</template>

<script>
export default {
  props: ['iconName', 'tooltipText'],
  data () {
    return {
      instance: null 
    }
  },
  mounted () {
    if (this.tooltipText) {
      const elem = this.$refs['tooltipped-button']
      const options = {
        enterDelay: 0,
        outDuration: 0 
      }
      this.instance = M.Tooltip.init(elem)
    }
  },
  methods: {
    handleClick () {
      if (this.instance) {
        this.instance.close()
      }
      this.$emit('click')
    }
  }
}
</script>
  