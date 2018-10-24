<template>
  <div>
    <base-button @click="playAnimation()">Replay Doodle</base-button>
    <canvas :id="this.id" class="doodle-element" resize></canvas>
  </div>
</template>

<script>
import paper from 'paper'

var STROKE_WIDTH = 2
var TOTAL_POINTS = 0

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
		this.id = 'wb' + this._uid
		this.paper = new paper.PaperScope()
		let newScope = this.paper
		this.$emit('new-scope', newScope)
	},
	mounted() {
		this.canvas = document.getElementById(this.id)
		this.paper.setup(this.id)
		this.width = this.paper.project.view.viewSize.width
		this.height = this.paper.project.view.viewSize.height
		this.paper.project.view.onResize = event => {
			this.width = event.size.width
			this.height = event.size.height
		}
		this.renderEntireNote()
	},
	watch: {
		allStrokes() {
			this.renderEntireNote()
		}
	},
	beforeDestroy() {
		this.paper = null
	},
	methods: {
		renderEntireNote() {
			if (!this.allStrokes) {
				return
			}
			if (this.allStrokes.length == 0 || this.loadedPreviousDrawings) {
				return
			}
			console.log('this.allStrokes =', this.allStrokes)
			this.allStrokes.forEach(stroke => {
				this.drawPath(stroke)
				// so the whiteboard does not keep drawing on any available view even if this instance is destroyed
				if (!this.paper) {
					return
				}
			})
			this.loadedPreviousDrawings = true
		},
		async playAnimation() {
			if (!this.allStrokes) {
				return
			}
			if (this.allStrokes.length == 0) {
				return
			}
			function timeout(ms) {
				return new Promise(resolve => setTimeout(resolve, ms))
			}
			this.paper.project.activeLayer.removeChildren()
			const strokes = this.allStrokes
			const n = strokes.length
			// determine drawing speedq
			let strokePeriod = 0
			if (n < 10) {
				strokePeriod = 500
			} else if (n < 20) {
				strokePeriod = 250
			} else if (n < 40) {
				strokePeriod = 100
			} else {
				strokePeriod = 30
			}
			for (let i = 0; i < n; i++) {
				this.drawPath(strokes[i])
				await timeout(strokePeriod)
				// so the whiteboard does not keep drawing on any available view even if this instance is destroyed
				if (!this.paper) {
					return
				}
			}
			console.log('total # of points =', TOTAL_POINTS)
		},
		drawPath(data) {
			this.paper.activate() // so the autodrawing phase doesn't fuck up
			let path = new this.paper.Path()
			path.strokeCap = 'round'
			path.strockJoin = 'round'
			if (data.isEraser) {
				path.strokeColor = 'white'
				path.strokeWidth = 30
			} else {
				path.strokeColor = 'green'
				path.strokeWidth = STROKE_WIDTH
			}
			data.points.forEach(point => {
				TOTAL_POINTS += 1
				path.add(
					new this.paper.Point(this.width * point.x, this.height * point.y)
				)
			})
			path.smooth()
		}
	}
}
</script>

<style lang="scss" scoped>
canvas {
	width: 100%;
	height: 100%;
	background: white;
}
</style>
