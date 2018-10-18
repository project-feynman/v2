<template>
  <div>
    <canvas :id="this.id" class="doodle-element" resize></canvas>
  </div>
</template>

<script>
import paper from 'paper'

var STROKE_WIDTH = 2

let local = {
	path: null,
	group: null
}

export default {
	props: {
		allStrokes: Array,
		strokeColor: {
			type: String,
			default: 'purple'
		}
	},
	data() {
		return {
			scaleFactorX: 1,
			scaleFactorY: 1,
			canvas: null,
			height: null,
			width: null,
			whiteboard: null,
			loadedPreviousDrawings: false,
			paper: null,
			id: null
		}
	},
	created() {
		console.log('allStrokes (from Doodle) =', this.allStrokes)
		this.id = 'wb' + this._uid
		console.log('this._uid =,', this._uid)
		this.paper = new paper.PaperScope()
		console.log('whiteboard, paper =', this.id, this.paper._id)
	},
	mounted() {
		this.canvas = document.getElementById(this.id)
		this.paper.setup(this.id)
		console.log(
			`during setup, whiteboard ${this.id}'s view is ${this.paper.view}`
		)
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
			this.scaleFactorX = this.canvas.scrollWidth / 1000
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
			let strokePeriod = 0
			if (n < 10) {
				strokePeriod = 600
			} else if (n < 20) {
				strokePeriod = 300
			} else if (n < 40) {
				strokePeriod = 150
			} else {
				strokePeriod = 50
			}
			for (let i = 0; i < n; i++) {
				this.drawPath(strokes[i])
				await timeout(strokePeriod)
				// so the whiteboard does not keep drawing on any available view even if this instance is destroyed
				if (this.paper === undefined || this.paper === null) {
					return
				}
			}
			// console.log('finished drawing')
			// console.log('whiteboard, paper =', this.id, this.paper._id)
			this.loadedPreviousDrawings = true
		},
		drawPath(data) {
			let path = new paper.Path()
			this.paper.activate()
			// console.log(
			// 	`drawing: component ID = ${this._uid}, scope ID = ${
			// 		this.paper._id
			// 	}, view = ${this.paper.view}, stroke color ${this.strokeColor}`
			// )
			path.strokeColor = this.strokeColor
			path.strokeWidth = STROKE_WIDTH
			// path.strokeCap = 'round'
			// path.strockJoin = 'round'
			data.points.forEach(point => {
				path.add(
					new paper.Point(
						this.scaleFactorX * point.x,
						this.scaleFactorY * point.y
					)
				)
			})
			// path.smooth()
			path.simplify()
		}
	}
}
</script>

<style lang="scss" scoped>
canvas {
	position: absolute;
	top: -100px;
	left: -222px;
	// margin: auto;
	width: 650px;
	height: 350px;
	background: white;
}
</style>
