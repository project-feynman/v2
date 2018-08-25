<template>
  <div>
    <h2 class="center">My Doodles</h2>
    <canvas id="whiteboard" resize></canvas>
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
    // console.log(`myDoodles = ${JSON.stringify(myDoodles)}`)
    this.drawAllPaths()
  },
  methods: {
    drawAllPaths () {
      if (this.doodles == null) {
        console.log('no doodles to be drawn')
        return 
      } 
      console.log('drawing doodle')
      this.doodles[0].paths.forEach(data => {
        var path = new Path()
        path.strokeColor = 'pink'
        data.points.forEach(point => {
          path.add(new Point(point.x, point.y))
        })
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