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
  props: ['allStrokes'],
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
  computed: {
    user () {
      return this.$store.state.user 
    }
  },
  watch: {
    user () {
      if (this.user != null && this.user != 'undetermined') {
        if (!this.onMouseUpInitialized) {
          this.initOnMouseUp() 
        } 
      }
    },
    allStrokes () {
      this.updateBoard()
    }
  },
  mounted () {
    // setup paper.js 
    this.paper.setup('whiteboard')
    if (this.allStrokes != []) {
      this.drawAllPaths() 
    }
    if (this.user != null && this.user != 'undetermined') {
      if (!this.onMouseUpInitialized) {    
        this.initOnMouseUp()
      }
    }
  },
  methods: {
    updateBoard () {
      if (!this.loadedPreviousDrawings) {
        this.drawAllPaths()
      }
    },
    async drawAllPaths () {
      if (this.allStrokes.length == 0) {
        return 
      }
      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }
      const strokes = this.allStrokes
      const n = strokes.length 
      for (var i = 0; i < n; i++) {
        this.drawPath(strokes[i])
        await timeout(500)
      }
      this.loadedPreviousDrawings = true 
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

<style lang="scss" scoped>
canvas {
  height: 100%;
  width: 100%;
  background: white;
}
</style>