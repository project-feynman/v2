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
        console.log('user determined, setting onMouseUp callback')
        // already initialized 
        if (onMouseUpInitialized) {
          return 
        }
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
          this.chatRoom.allPaths.push(pathObj)
          // push the new "path" to Firestore 
          const updatedPaths = this.chatRoom.allPaths
          const roomID = this.$route.params.room_id
          const ref = db.collection('whiteboards').doc(roomID)
          await ref.update({
            allPaths: updatedPaths
          })
          console.log('uploaded what you just drawn to Firestore!')
          this.path = null 
        }
      }
    }
  },
  data () {
    return {
      path: null,
      chatRoom: null,
      numOfPaths: 0,
      initialRender: true,
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
        this.chatRoom.allPaths.push(pathObj)
        // push the new "path" to Firestore 
        const updatedPaths = this.chatRoom.allPaths
        const roomID = this.$route.params.room_id
        const ref = db.collection('whiteboards').doc(roomID)
        await ref.update({
          allPaths: updatedPaths
        })
        console.log('uploaded what you just drawn to Firestore!')
        this.path = null 
      }
    }
    const roomID = this.$route.params.room_id
    const ref = db.collection('whiteboards').doc(roomID)
    ref.onSnapshot(doc => {
      console.log('onSnapshot()')
      this.chatRoom = doc.data()
      // console.log(`this.chatRoom = ${JSON.stringify(this.chatRoom)}`)
      if (this.initialRender) {
        this.drawAllPaths()
        this.numOfPaths = this.chatRoom.allPaths.length 
        this.initialRender = false
      } else {
        // console.log(`data = ${JSON.stringify(doc.data())}`)
        const updatedPaths = doc.data().allPaths
        const n = updatedPaths.length 
        console.log(`n = ${n}, numOfPaths = ${this.numOfPaths}`)
        if (n >= this.numOfPaths) {
          console.log('n > numOfPaths')
          this.numOfPaths = n 
          const newestPath = updatedPaths[n-1]
          console.log(`new path = ${JSON.stringify(newestPath)}`)
          // you were the one who drew the new path: no need to re-render 
          console.log(`author = ${newestPath.author}, user uid = ${this.user.uid}`)
          if (newestPath.author == this.user.uid) {
            console.log('not drawing new path - because you drew it yourself')
            return 
          }
          var whiteboardPath = new Path()
          whiteboardPath.strokeColor = 'green'
          newestPath.points.forEach(point => {
            whiteboardPath.add(new Point(point.x, point.y))
          })
          console.log('successfully drawn new line')
        } else {
          console.log('it probably means that you reset the board')
          this.numOfPaths = n 
          project.activeLayer.removeChildren()
          console.log('removed children')
        }
      }
    }) 
  },
  methods: {
    async resetBoard () {
      const ref = db.collection('whiteboards').doc(this.$route.params.room_id)
      await ref.update({
        allPaths: []
      })
      project.activeLayer.removeChildren()
      console.log('successfully reset whiteboard')
    },
    drawAllPaths () {
      this.chatRoom.allPaths.forEach(data => {
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