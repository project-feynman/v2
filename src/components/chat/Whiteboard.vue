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
      path: null 
    }
  },
  mounted () {
    paper.setup('whiteboard')
    var tool = new Tool()
    console.log(`tool = ${tool}`)
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
    }

  },
  data () {
    return {
      myPath: null 
    }
  },
  methods: {
    onMouseDown(event) {
      myPath = new Path();
      myPath.strokeColor = 'black';
    },
    onMouseDrag(event) {
      myPath.add(event.point);
    },
    onMouseUp(event) {
      var myCircle = new Path.Circle({
        center: event.point,
        radius: 10
      });
      myCircle.strokeColor = 'black';
      myCircle.fillColor = 'white';
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