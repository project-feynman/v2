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
		this.id = 'wb' + this._uid
		this.paper = new paper.PaperScope()
		let newScope = this.paper
		this.$emit('new-scope', newScope)
	},
	mounted() {
		this.canvas = document.getElementById(this.id)
		this.paper.setup(this.id)
		this.paper.project.view.onResize = function(event) {
			// Whenever the view is resized, move the path to its center:
			console.log('view was resized!')
			console.log('event =', event)
		}

		this.drawAllPaths()
	},
	watch: {
		allStrokes() {
			this.drawAllPaths()
		},
		canvas() {
			// will probably only trigger once - not actually reactive
			this.height = this.canvas.scrollHeight
			this.width = this.canvas.scrollWidth
			this.scaleFactorX = this.canvas.scrollWidth / 1300
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
			this.loadedPreviousDrawings = true
			function timeout(ms) {
				return new Promise(resolve => setTimeout(resolve, ms))
			}
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
			// console.log('whiteboard, paper =', this.id, this.paper._id)
			this.loadedPreviousDrawings = true
		},
		drawPath(data) {
			this.paper.activate()
			// so the autodrawing phase doesn't fuck
			let path = new this.paper.Path()
			path.strokeColor = this.strokeColor
			path.strokeWidth = STROKE_WIDTH
			// path.strokeCap = 'round'
			// path.strockJoin = 'round'
			data.points.forEach(point => {
				path.add(
					new this.paper.Point(
						this.scaleFactorX * point.x,
						this.scaleFactorY * point.y
					)
				)
			})
			// path.smooth()
		}
	}
}
</script>

<style lang="scss" scoped>
canvas {
	position: absolute;
	top: -100px;
	left: -222px;
	width: 650px;
	height: 350px;
	background: white;
}
</style>
