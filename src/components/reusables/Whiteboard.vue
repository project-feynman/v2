<template>
  <div>
    <canvas id="whiteboar" resize></canvas>
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
      onMouseUpInitialized: false
    }
  },
  created () {
    paper.install(window)
    console.log(`allStrokes = ${JSON.stringify(this.allStrokes)}`)
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
    paper.setup('whiteboar')
    var tool = new Tool()
    tool.onMouseDown = event => {
      PATH = new Path()
      PATH.strokeColor = 'black'
    }
    tool.onMouseDrag = event => {
      PATH.add(event.point)
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
        this.numOfPaths = this.allStrokes.length 
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
    },
    drawAllPaths () {
      this.allStrokes.forEach(stroke => {
        var path = new Path()
        path.strokeColor = 'pink'
        stroke.points.forEach(p => path.add(new Point(p.x, p.y)))
      })
      this.loadedPreviousDrawings = true
    },
    initOnMouseUp () {
      this.onMouseUpInitialized = true 
      tool.onMouseUp = async event => {
        PATH.add(event.point)
        PATH.simplify()
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
        this.$emit('new-stroke', pathObj)

        // update to firestore using the array modification syntax
        // this.whiteboard.allPaths.push(pathObj)
        // push the new "path" to Firestore 
        // const updatedPaths = this.whiteboard.allPaths
        // const roomID = this.$route.params.room_id
        // const ref = db.collection('whiteboards').doc(roomID)
        // ref.update({
        //   allPaths: updatedPaths
        // })
        // PATH = null 
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