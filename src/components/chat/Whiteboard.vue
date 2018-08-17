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
      path: null,
      allPaths: [],
      example: { 
        point: { x: 576, y: 92.19034 }, 
        handleOut: { x: -14.67857, y: 1.00595 } 
      }
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
      console.log('event.point =', event.point)
      this.path.simplify()
      this.path.smooth()
      const segments = this.path.getSegments()
      console.log(`segments = ${segments}`)
      console.log(`EXAMPLE = ${this.example}`)
      this.allPaths.push(this.path)
      this.path = null 
      console.log(`paper = ${paper}`)
    }
    // see if you can initialize some drawings on the Canvas 
    // var examplePath = new Path()
    // examplePath._segments = { point: { x: 576, y: 92.19034 }, handleOut: { x: -14.67857, y: 1.00595 } }
    // console.log('successfully set example path')
    // const examplePathSegments = examplePath.getSegments()
    // console.log('examplePathSegments =', examplePathSegments)
    // paper.view.update()
    // console.log(`paper.view = ${paper.view}`)
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
    // add triggers a redraw

    
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