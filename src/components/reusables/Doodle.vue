<template>
  <div>
    <div class="center">
      <base-button @click="playAnimation()">Replay</base-button>
      <!-- <base-button @click="speedUpReplay()">Speed Up Replay</base-button> -->
    </div>
    <div class="center">
      <canvas :id="this.id" width="1000" height="1200"></canvas>
    </div>
  </div>
</template>

<script>
var TOTAL_POINTS = 0

export default {
	props: {
		allStrokes: Array,
		small: Boolean
	},
	data() {
		return {
			canvas: null,
			loadedPreviousDrawings: false,
			id: null,
			pointPeriod: 0.000001,
			strokeSpeed: 100
		}
	},
	created() {
		this.id = 'wb' + this._uid
	},
	mounted() {
		this.canvas = document.getElementById(this.id)
		if (this.small) {
			this.canvas.width = 800
			this.canvas.height = 1000
		} else {
			this.canvas.width = window.innerWidth * 0.8
			this.canvas.width = window.innerHeight
		}
		this.ctx = this.canvas.getContext('2d')
		this.renderEntireNote()
	},
	watch: {
		allStrokes() {
			this.renderEntireNote()
		}
	},
	methods: {
		speedUpReplay() {
			this.pointPeriod = 1
			this.strokeSpeed = 2
		},
		renderEntireNote() {
			if (!this.allStrokes) {
				return
			}
			if (this.allStrokes.length == 0 || this.loadedPreviousDrawings) {
				return
			}
			this.allStrokes.forEach(stroke => {
				this.drawPath(stroke)
			})
			this.loadedPreviousDrawings = true
		},
		async playAnimation() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
			if (!this.allStrokes) {
				return
			}
			if (this.allStrokes.length == 0) {
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
				strokePeriod = 500
			} else if (n < 20) {
				strokePeriod = 250
			} else if (n < 40) {
				strokePeriod = 100
			} else {
				strokePeriod = 30
			}
			for (let i = 0; i < n; i++) {
				await this.drawPath(strokes[i], false) // draw incrementally, not instantly
				await timeout(strokePeriod / this.strokeSpeed)
			}
			console.log('total # of points =', TOTAL_POINTS)
		},
		async drawPath(data, instant = true) {
			if (data.isEraser) {
				this.ctx.strokeStyle = 'white'
				this.ctx.lineWidth = 20
				this.ctx.lineCap = 'round'
			} else {
				this.ctx.strokeStyle = 'purple'
				this.ctx.lineWidth = 2
				this.ctx.lineCap = 'round'
			}
			const points = data.points
			this.ctx.beginPath()
			// move to the first point
			this.ctx.moveTo(
				points[0].x * this.canvas.width,
				points[0].y * this.canvas.height
			)
			const n = points.length
			for (let i = 1; i < n; i++) {
				this.ctx.lineTo(
					points[i].x * this.canvas.width,
					points[i].y * this.canvas.height
				)
				this.ctx.stroke()
				if (!instant) {
					await timeout(this.pointPeriod)
				}
			}
			function timeout(ms) {
				return new Promise(resolve => setTimeout(resolve, ms))
			}
			let promise = new Promise(resolve => setTimeout(resolve, 0))
			promise.catch(error => console.log('error =', error))
			return promise
		}
	}
}
</script>

<style lang="scss" scoped>
canvas {
	background: white;
	display: block;
	margin: 0 auto;
}
</style>
