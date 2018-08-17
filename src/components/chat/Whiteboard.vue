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
      // pathID: 0,
      path: null,
      chatRoom: null,
      allPaths: []
    }
  },
  mounted () {
    const roomID = this.$route.params.room_id
    this.$bind('chatRoom', db.collection('chatRooms').doc(roomID))
    .then(doc => {
      // load drawings from all previous sessions 
      this.chatRoom.allPaths.forEach(data => {
        var path = new Path()
        path.strokeColor = 'pink'
        // path.moveTo(new Point(0, 0))
        data.points.forEach(point => {
          path.add(new Point(point.x, point.y))
        })
      })
      // whenever a new path is added to Firestore, update the board
      const ref = db.collection('chatRooms').where('id', '==', this.$route.params.room_id)
      ref.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          console.log(`change = ${change}`)
          if (change.type == 'added') {
            console.log('now, just draw this new line')
            console.log(`change.do.data() = ${change.doc.data()}`)
            // this.comments.unshift({
            //   from: change.doc.data().from,
            //   content: change.doc.data().content
            // })
          }
        })
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
      var pathObj = {} // contains "points" and "pathID"
      var points = [] 
      segments.forEach(segment => {
        var point = {} 
        point.x = segment.point.x
        point.y = segment.point.y 
        points.push(point)
      })
      // pathObj.pathID = this.pathID 
      pathObj.points = points 
      // this.pathID = this.pathID + 1 
      this.chatRoom.allPaths.push(pathObj)
      // push the new "path" to Firestore 
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