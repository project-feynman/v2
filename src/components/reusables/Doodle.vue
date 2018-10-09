<template>
  <div>
    <canvas :id="this.id" resize></canvas>
  </div>
</template>

<script>
import paper from 'paper'
import db from '@/firebase/init.js'

var PATH = null
var STROKE_WIDTH = 2

export default {
	props: {
		allStrokes: Array
	},
	data() {
		return {
			scaleFactorX: 1,
			scaleFactorY: 1,
			canvas: null,
			height: null,
			width: null,
			whiteboard: null,
			numOfPaths: 0,
			loadedPreviousDrawings: false,
			onMouseUpInitialized: false,
			paper: null,
			id: null
		}
	},
	created() {
		console.log('allStrokes (from Doodle) =', this.allStrokes)
		this.id = 'wb' + this._uid
		this.paper = new paper.PaperScope()
		this.paper.install(window)
	},
	mounted() {
		this.canvas = document.getElementById(this.id)
		this.paper.setup(this.id)
		this.drawAllPaths()
	},
	watch: {
		allStrokes() {
			this.drawAllPaths()
		},
		canvas() {
			// will probably only trigger once
			this.height = this.canvas.scrollHeight
			this.width = this.canvas.scrollWidth
			this.scaleFactorX = this.canvas.scrollWidth / 900
			this.scaleFactorY = this.canvas.scrollHeight / 500
		}
	},
	beforeDestroy() {
		this.paper = null
	},
	methods: {
		async drawAllPaths() {
			if (!this.allStrokes) {
				return
			}
			if (this.allStrokes.length == 0 || this.loadedPreviousDrawings) {
				return
			}
			function timeout(ms) {
				return new Promise(resolve => setTimeout(resolve, ms))
			}
			const strokes = this.allStrokes
			const n = strokes.length
			// determine drawing speed
			var strokePeriod = 0
			if (n < 10) {
				strokePeriod = 600
			} else if (n < 20) {
				strokePeriod = 300
			} else if (n < 40) {
				strokePeriod = 150
			} else {
				strokePeriod = 50
			}
			for (var i = 0; i < n; i++) {
				this.drawPath(strokes[i])
				await timeout(strokePeriod)
				if (this.paper === undefined || this.paper === null) {
					return
				}
			}
			this.loadedPreviousDrawings = true
		},
		drawPath(data) {
			var path = new Path()
			this.paper.activate()
			path.strokeColor = 'pink'
			path.strokeWidth = STROKE_WIDTH
			path.strokeCap = 'round'
			path.strockJoin = 'round'
			data.points.forEach(point => {
				path.add(
					new Point(this.scaleFactorX * point.x, this.scaleFactorY * point.y)
				)
			})
			path.smooth()
		}
	}
}
</script>

<style lang="scss" scoped>
canvas {
	width: 400px;
	height: 300px;
	background: white;
}
</style>
