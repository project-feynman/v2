<template>
  <div>
    <canvas id="whiteboard" resize></canvas>
  </div>
</template>

<script>
import paper from 'paper'
import db from '@/firebase/init.js'

var PATH = null 

export default {
  props: {
    allStrokes: Array,
    scaleFactor: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      whiteboard: null,
      numOfPaths: 0,
      loadedPreviousDrawings: false,
      onMouseUpInitialized: false,
      paper: null 
    }
  },
  created () {
    this.paper = new paper.PaperScope()
    this.paper.install(window)
  },
  mounted () {
    // setup paper.js 
    this.paper.setup('whiteboard')
    this.drawAllPaths() 
  },
  watch: {
    allStrokes () {
      this.drawAllPaths()
    }
  },
  methods: {
    async drawAllPaths () {
      if (this.allStrokes.length == 0 || this.loadedPreviousDrawings) {
        return 
      }
      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }
      const strokes = this.allStrokes
      const n = strokes.length 
      // determine drawing speed 
      var strokePeriod = 0 
      if (n < 10) {
        strokePeriod = 600 
      } else if (n < 20) {
        strokePeriod = 300 
      } else if (n < 40) {
        strokePeriod = 150
      } else {
        strokePeriod = 50 
      }
      for (var i = 0; i < n; i++) {
        this.drawPath(strokes[i])
        await timeout(strokePeriod)
      }
      this.loadedPreviousDrawings = true 
    },
    drawPath (data) {
      var path = new Path()
      path.strokeColor = 'pink'
      data.points.forEach(point => {
        path.add(new Point(this.scaleFactor * point.x, this.scaleFactor * point.y))
      })
    }
  }
}
</script>

<style lang="scss" scoped>
canvas {
  height: 100%;
  width: 100%;
  background: white;
}
</style>