<template>
  <div>
    <canvas id="notepad" resize></canvas>
    <base-button @click="resetBoard()">Reset board</base-button>
  </div>
</template>

<script>
import paper from 'paper'
import db from '@/firebase/init.js'
import { mapState } from 'vuex'

var PATH = null 
var STROKE_WIDTH = 2
var PREV_X = null
var PREV_Y = null
var PREV_RECORDED = false

export default {
  data () {
    return {
      tool: null,
      allStrokes: []
    }
  },
  computed: {
    ...mapState(['user', 'hasFetchedUser'])
  },
  destroyed () {
    console.log('Paper instance destroyed')
  },
  watch: {
    hasFetchedUser: {
      handler: 'initMouseTools',
      immediate: true
    }
  },
  mounted () {
    paper.setup('notepad')
  },
  methods: {
    resetBoard () {
      this.allStrokes = []
      project.activeLayer.removeChildren()
    },
    initMouseTools () {
      paper.install(window)
      console.log('Notepad: attempt to initMouseTools')
      if (!this.hasFetchedUser) {
        console.log('Failed - user info. is not yet fetched')
        return 
      }
      if (!this.tool) {
        this.tool = new Tool()
      }
      this.tool.onMouseUp = async event => {
        PATH.add(event.point)
        PATH.smooth()
        // const segments = this.path.getSegments()
        const segments = PATH.getSegments()
        // save the "path" that the user has just drawn
        var pathObj = {} 
        var points = [] 
        segments.forEach(segment => {
          var point = {} 
          point.x = segment.point.x
          point.y = segment.point.y 
          points.push(point)
        })
        pathObj.points = points 
        pathObj.author = this.user.uid
        this.allStrokes.push(pathObj)
        console.log(`pushed ${JSON.stringify(pathObj)} to allStrokes`)
        PATH = null 
      }
      this.tool.onMouseDown = event => {
        PATH = new Path()
        PATH.strokeColor = 'black'
        PATH.strokeWidth = STROKE_WIDTH
        PATH.strokeCap='round'
        PATH.strokeJoin='round'
        PATH.add(event.point)
        PREV_X = event.point.x
        PREV_Y = event.point.y
        PREV_RECORDED = true
      }
      this.tool.onMouseDrag = event => {
        var s = PATH.getSegments()
        var ep = event.point
        var dx = ep.x-PREV_X
        var dy = ep.y-PREV_Y
        if (dx*dx+dy*dy>10) {
            PREV_X = ep.x
            PREV_Y = ep.y
            PREV_RECORDED = true
            PATH.add(event.point)
            PATH.smooth()
        }
        else {
          if (!PREV_RECORDED) {
            PATH.removeSegment(s.length-1)
          }
          PATH.add(event.point)
          PREV_RECORDED = false
        }
      }
      console.log('Notepad: finished initialization')
    }
  }
}
</script>

<style lang="scss" scoped>
canvas {
  height: 484px;
  width: 100%;
  background: white;
}
</style>
