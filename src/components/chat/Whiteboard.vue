<template>
  <div>
    <canvas id="whiteboard" resize></canvas>
  </div>
</template>

<script>
import paper from 'paper'
import { version } from 'moment'
import db from '@/firebase/init.js'

var PATH = null 
var STROKE_WIDTH = 2
var PREV_X = null
var PREV_Y = null
var PREV_RECORDED = false

export default {
  computed: {
    user () {
      return this.$store.state.user 
    },
    hasFetchedUser () {
      return this.$store.state.hasFetchedUser 
    }
  },
  data () {
    return {
      whiteboard: null,
      numOfPaths: 0,
      loadedPreviousDrawings: false,
      tool: null 
    }
  },
  created () {
    paper.install(window)
  },
  watch: {
    hasFetchedUser: {
      handler: 'initMouseTools',
      immediate: true 
    }
  },
  mounted () {
    paper.setup('whiteboard')
    // sync whiteboard to Firestore 
    const roomID = this.$route.params.room_id
    const ref = db.collection('whiteboards').doc(roomID)
    ref.onSnapshot(doc => {
      this.whiteboard = doc.data()
      if (!this.loadedPreviousDrawings) {
        this.drawAllPaths()
        this.numOfPaths = this.whiteboard.allPaths.length 
      } else {
        const updatedPaths = doc.data().allPaths
        const n = updatedPaths.length 
        // probably means user's board is outdated
        if (n >= this.numOfPaths) {
          this.numOfPaths = n 
          const newestPath = updatedPaths[n-1]
          if (newestPath.author != this.user.uid) {
            var whiteboardPath = new Path()
            whiteboardPath.strokeColor = 'green'
            newestPath.points.forEach(point => {
              whiteboardPath.add(new Point(point.x, point.y))
            })
          }
        } else {
          this.numOfPaths = n // probably means board has been reset
          project.activeLayer.removeChildren()
        }
      }
    }) 
  },
  methods: {
    async resetBoard () {
      const roomID = this.$route.params.room_id
      const ref = db.collection('whiteboards').doc(roomID)
      await ref.update({
        allPaths: []
      })
    },
    drawAllPaths () {
      if (this.whiteboard == null) { return }
      this.whiteboard.allPaths.forEach(stroke => {
        var path = new Path()
        path.strokeColor = 'pink'
        path.strokeWidth = STROKE_WIDTH
        stroke.points.forEach(p => {
          path.add(new Point(p.x, p.y))
        })
          path.smooth()
      })
      this.loadedPreviousDrawings = true
    },
    initMouseTools () {
      if (!this.hasFetchedUser) {
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
        this.whiteboard.allPaths.push(pathObj)
        // push the new "path" to Firestore 
        const updatedPaths = this.whiteboard.allPaths
        const roomID = this.$route.params.room_id
        const ref = db.collection('whiteboards').doc(roomID)
        ref.update({
          allPaths: updatedPaths
        })
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
