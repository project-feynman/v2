<template>
  <div>
    <canvas id="whiteboard" resize>
    </canvas>
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
  data () {
    return {
      pathID: 0,
      path: null,
      chatRoom: null,
      allPaths: []
    }
  },
  mounted () {
    // connect to firebase 
    const roomID = this.$route.params.room_id
      this.$bind('chatRoom', db.collection('chatRooms').doc(roomID))
    .then(doc => {
      this.chatRoom.allPaths.forEach(data => {
        var path = new Path()
        path.strokeColor = 'pink'
        path.moveTo(new Point(0, 0))
        data.points.forEach(point => {
          path.add(new Point(point.x, point.y))
        })
      })
    })
    .catch((error) => {
      console.log('error in loading: ', error)
    })
    paper.setup('whiteboard')
    var tool = new Tool()
    tool.onMouseDown = event => {
      this.path = new Path()
      this.path.strokeColor = 'black'
    }
    tool.onMouseDrag = event => {
      this.path.add(event.point)
      console.log(`path = ${this.path.toString()}`)
    }
    tool.onMouseUp = event => {
      this.path.add(event.point)
      this.path.simplify()
      this.path.smooth()
      const segments = this.path.getSegments()
      // store the points in sequence - hopefully it'll reflect what the users drew 
      var pathObj = {} // contains "points" and "pathID"
      var points = [] 
      segments.forEach(segment => {
        var point = {} 
        point.x = segment.point.x
        point.y = segment.point.y 
        points.push(point)
      })
      pathObj.pathID = this.pathID 
      pathObj.points = points 
      this.pathID = this.pathID + 1 
    
      this.chatRoom.allPaths.push(pathObj)
      const updatedPaths = this.chatRoom.allPaths
      const ref = db.collection('chatRooms').doc(roomID)
      ref.update({
        allPaths: updatedPaths
      })
      this.path = null 
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