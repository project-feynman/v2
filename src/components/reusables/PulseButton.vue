      
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
        enterDelay: 100,
        outDuration: 0 
      }
      this.instance = M.Tooltip.init(elem)
      console.log('initialized tooltipped component')
    }
  },
  methods: {
    handleClick () {
      this.instance.close()
      console.log('tooltip message should be hidden')
      this.$emit('click')
    }
  }
}
</script>
  