<template>
  <div>
    <h2 class="center">My Doodles</h2>
      <!-- <template v-for="(doodle, idx) in doodles"> -->
      <!-- <div v-if="doodles">{{ doodles[0].title }}</div> -->
      <canvas id="video" resize></canvas>
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
    paper.setup('video')
    const myDoodles = await this.$bind('doodles', db.collection('doodles'))
    this.drawAllPaths()
  },
  methods: {
    async drawAllPaths () {
      if (this.doodles == null) { return } 
      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }
      const paths = this.doodles[0].paths
      const n =  paths.length 
      for (var i=0; i<n; i++) {
        this.drawPath(paths[i])
        await timeout(500)
      }
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