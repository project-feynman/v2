<template>
  <a @click="handleClick()" ref="tooltipped-button" :data-tooltip="tooltipText" :class="`btn-floating btn-${size} waves-effect waves-light ${color}`">
    <i class="material-icons">{{ iconName }}</i>
  </a>
</template>

<script>
export default {
  // props: ['color', 'size', 'iconName', 'tooltipText'],
  props: {
    color: String,
    size: {
      type: String,
      default () {
        return 'medium'
      }
    },
    iconName: String,
    tooltipText: String
  },
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
      if (this.instance != null) {
        this.instance.close()
      }
      this.$emit('click')
    }
  }
}
</script>
