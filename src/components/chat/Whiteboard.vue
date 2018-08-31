<template>
  <div>
    <div class="center">
      <base-button @click="resetBoard()">Reset Board</base-button>
    </div>
    <canvas id="whiteboard" resize></canvas>
  </div>
</template>

<script>
import paper from 'paper'
import { version } from 'moment'
import db from '@/firebase/init.js'

var PATH = null 

export default {
  created () {
    console.log('created()')
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
          console.log('initializing onMouseUp from watcher')
          this.initOnMouseUp() 
        } 
      }
    }
  },
  data () {
    return {
      whiteboard: null,
      numOfPaths: 0,
      loadedPreviousDrawings: false,
      onMouseUpInitialized: false
    }
  },
  mounted () {
    // setup paper.js 
    paper.setup('whiteboard')
    var tool = new Tool()
    tool.onMouseDown = event => {
      PATH = new Path()
      PATH.strokeColor = 'black'
    }
    console.log('initialized onMouseDown successfully')
    tool.onMouseDrag = event => {
      PATH.add(event.point)
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
        stroke.points.forEach(p => path.add(new Point(p.x, p.y)))
      })
      this.loadedPreviousDrawings = true
    },
    initOnMouseUp () {
      this.onMouseUpInitialized = true 
      tool.onMouseUp = async event => {
        console.log('onMouseUp()')
        PATH.add(event.point)
        PATH.simplify()
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