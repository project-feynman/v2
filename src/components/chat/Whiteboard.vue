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
  data () {
    return {
      path: null,
      chatRoom: null,
      allPaths: [],
      numOfPaths: 0
    }
  },
  mounted () {
    const roomID = this.$route.params.room_id
    const ref = db.collection('chatRooms').doc(roomID)
    this.$bind('chatRoom', ref)
    .then(doc => {
      // load drawings from all previous sessions 
      this.drawAllPaths()
      var numOfPaths = this.chatRoom.allPaths.length 
      ref.onSnapshot(doc => {
        // console.log(`data = ${JSON.stringify(doc.data())}`)
        const updatedPaths = doc.data().allPaths
        const n = updatedPaths.length 
        console.log(`n = ${n}, numOfPaths = ${this.numOfPaths}`)
        console.log('either the if or the else statement will trigger')
        if (n > this.numOfPaths) {
          console.log('n > numOfPaths')
          this.numOfPaths = n 
          const newestPath = updatedPaths[n-1]
          console.log(`new path = ${JSON.stringify(newestPath)}`)
          if (newestPath.author == this.user.displayName) {
            return 
          }
          var whiteboardPath = new Path()
          newestPath.points.forEach(point => {
            whiteboardPath.add(new Point(point.x, point.y))
          })
          console.log('successfully drawn new line')
        } else {
          console.log('it probably means that you reset the board')
          this.numOfPaths = n 
          project.activeLayer.removeChildren()
        }
      }) 
    })
    .catch(error => console.log('error in loading: ', error))
    paper.setup('whiteboard')
    var tool = new Tool()
    tool.onMouseDown = event => {
      this.path = new Path()
      this.path.strokeColor = 'black'
    }
    tool.onMouseDrag = event => {
      this.path.add(event.point)
    }
    tool.onMouseUp = event => {
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
      pathObj.author = this.user.displayName
      this.chatRoom.allPaths.push(pathObj)
      // push the new "path" to Firestore 
      const updatedPaths = this.chatRoom.allPaths
      const ref = db.collection('chatRooms').doc(roomID)
      ref.update({
        allPaths: updatedPaths
      })
      this.path = null 
    }
  },
  methods: {
    async resetBoard () {
      const ref = db.collection('chatRooms').doc(this.$route.params.room_id)
      await ref.update({
        allPaths: []
      })
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