<template>
  <div>
    <canvas id="whiteboard" resize></canvas>
    <base-button @click="resetBoard()">Reset Board</base-button>
  </div>
</template>

<script>
import paper from 'paper'
import { version } from 'moment'
import db from '@/firebase/init.js'

export default {
  created () {
    paper.install(window)
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
    }
  },
  data () {
    return {
      path: null,
      whiteboard: null,
      numOfPaths: 0,
      loadedPreviousDrawings: false,
      onMouseUpInitialized: false
    }
  },
  mounted () {
    paper.setup('whiteboard')
    var tool = new Tool()
    tool.onMouseDown = event => {
      this.path = new Path()
      this.path.strokeColor = 'black'
    }
    tool.onMouseDrag = event => {
      this.path.add(event.point)
    }
    if (this.user != null && this.user != 'undetermined') {
      if (!this.onMouseUpInitialized) {
        this.initOnMouseUp()
      }
    }
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
      if (this.whiteboard != null) {
        this.whiteboard.allPaths.forEach(data => {
          var path = new Path()
          path.strokeColor = 'pink'
          data.points.forEach(point => {
            path.add(new Point(point.x, point.y))
          })
        })
        this.loadedPreviousDrawings = true
      } 
    },
    initOnMouseUp () {
      this.onMouseUpInitialized = true 
      tool.onMouseUp = async event => {
        this.path.add(event.point)
        this.path.simplify()
        this.path.smooth()
        const segments = this.path.getSegments()
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
        await ref.update({
          allPaths: updatedPaths
        })
        this.path = null 
      }
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