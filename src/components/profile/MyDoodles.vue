<template>
  <div>
    <h2 class="center">My Doodles</h2>
      <!-- <template v-for="(doodle, idx) in doodles"> -->
      <!-- <div v-if="doodles">{{ doodles[0].title }}</div> -->
      <canvas id="whiteboard" resize></canvas>
      <!-- </template> -->
  </div>
</template>

<script>
import db from '@/firebase/init.js'
import paper from 'paper'

export default {
  created () {
    paper.install(window)
  },
  data () {
    return {
      doodles: [] 
    }
  },
  async mounted () {
    paper.setup('whiteboard')
    const myDoodles = await this.$bind('doodles', db.collection('doodles'))
    this.drawAllPaths()
  },
  methods: {
    drawAllPaths () {
      if (this.doodles == null) {
        return 
      } 
      this.doodles[0].paths.forEach(data => this.drawPath(data))
    },
    drawPath (data) {
      var path = new Path()
      path.strokeColor = 'pink'
      data.points.forEach(point => {
        path.add(new Point(point.x, point.y))
      })
    }
  }
}
</script>

<style lang="scss">
canvas {
  height: 100%;
  width: 100%;
  background: white;
}
</style>