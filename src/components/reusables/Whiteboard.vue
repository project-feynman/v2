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
      }
    },
    async drawAllPaths () {
      if (this.allStrokes.length == 0) {
        console.log('there are no previous drawings to be rendered')
        return 
      }
      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }
      console.log(`strokes = ${this.allStrokes}`)
      const strokes = this.allStrokes
      const n = strokes.length 
      for (var i = 0; i < n; i++) {
        console.log('drawing a path')
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


        // DEFER TILL LATER - right now, there is no need to refacotr
        // the demo is the #1 priority 

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