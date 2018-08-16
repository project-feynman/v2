<template>
  <div>
    <canvas id="whiteboard" resize>
    </canvas>
  </div>
</template>

<script>
import paper from 'paper'
export default {
  created () {
    paper.install(window)
  },
  mounted () {
    paper.setup('whiteboard')
  }
}
</script>

<style lang="scss">
  canvas {
    height: 100%;
    width: 100%;
    background: lightblue;
  }
</style>