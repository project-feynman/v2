<template>
  <div>
    <canvas id="whiteboard" resize>
    </canvas>
  </div>
</template>

<script>
import paper from 'paper'
import { version } from 'moment';


export default {
  created () {
    paper.install(window)
  },
  data () {
    return {
      pathID: 0,
      path: null,
      allPaths: [{"pathID":0,"points":[{"x":426,"y":37.18751525878906},{"x":462,"y":38.18751525878906},{"x":525,"y":94.18751525878906},{"x":526,"y":109.18751525878906},{"x":499,"y":121.18751525878906},{"x":429,"y":132.18751525878906},{"x":418,"y":123.18751525878906},{"x":402,"y":113.18751525878906},{"x":400,"y":91.18751525878906},{"x":400,"y":85.18751525878906},{"x":428,"y":84.18751525878906},{"x":440,"y":87.18751525878906},{"x":467,"y":126.18751525878906}]}],
      example: { 
        point: { x: 576, y: 92.19034 }, 
        handleOut: { x: -14.67857, y: 1.00595 } 
      },
      dummyData: [
        {
          pathID: 1,
          points: [{x: 50, y: 100}, {x: 100, y: 150}]
        },
        {
          pathID: 2,
          points: [{x: 300, y: 100}, {x: 150, y: 50}]
        }
      ],
      testData: [{"point":{"x":658,"y":188.19036865234375},"pathID":0},{"point":{"x":464,"y":187.19036865234375},"pathID":1},{"point":{"x":392,"y":182.19036865234375},"pathID":2}]
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
      console.log(`path = ${this.path.toString()}`)
    }
    tool.onMouseUp = event => {
      this.path.add(event.point)
      this.path.simplify()
      this.path.smooth()
      const segments = this.path.getSegments()
      console.log(`here are the points from the line that you drews: ${segments}`)
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
      console.log(`pathObj = ${JSON.stringify(pathObj)}`)
      this.allPaths.push(pathObj)
      this.path = null 
    }

    var path = new Path()
    path.strokeColor = 'black'
    var start = new Point(100, 100)
    path.moveTo(start)
    path.lineTo(start.add([ 200, -50 ]))
    view.draw()
    var anotherPath = new Path()
    anotherPath.strokeColor = 'yellow'
    var s2 = new Point(50, 50)
    anotherPath.moveTo(s2)
    // see if using "add()" will automatically trigger an update event
    // anotherPath.lineTo(s2.add([200, 100]))
    anotherPath.add(new Point(150, 150))
    // "add" automatically triggers a redraw
    this.dummyData.forEach(data => {
      var path = new Path() 
      path.strokeColor = 'red'
      path.moveTo(new Point(0, 0))
      data.points.forEach(point => {
        path.add(new Point(point.x, point.y))
      })
    })
    console.log(`all paths = ${this.allPaths}`)
    this.allPaths.forEach(data => {
      console.log(`data = ${JSON.stringify(data)}`)
      var path = new Path()
      path.strokeColor = 'purple'
      path.moveTo(new Point(0, 0))
      data.points.forEach(point => {
        path.add(new Point(point.x, point.y))
      })
    })
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