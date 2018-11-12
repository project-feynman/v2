<template>
  <div>
    <!-- <h3>{{ DEBUG }}</h3>
    <h3>All paths = {{ allPaths }}</h3>
    <h3>Current path = {{ currentPath }}</h3> -->
    <canvas id="paper" width="1000" height="1200"/>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
import db from '@/firebase/init.js'
import { mapState } from 'vuex'

export default {
	props: ['isEraser'],
	data() {
		return {
			tool: null,
			whiteboard: null,
			loadedPreviousDrawings: false,
			onMouseUpInitialized: false,
			id: null,
			width: 0,
			height: 0,
			currentPath: [],
			allPaths: [],
			canvas: null,
			ctx: null,
			dragging: false,
			dragStartLocation: null,
			started: false,
			DEBUG: null
		}
	},
	computed: {
		...mapState({
			user: state => state.user.user,
			hasFetchedUser: state => state.user.hasFetchedUser
		})
	},
	// might not be necessary anymore as there is no database operation by default
	watch: {
		user() {
			if (this.user && this.hasFetchedUser) {
				if (!this.onMouseUpInitialized) {
					// this.initPaper()
				}
			}
		}
	},
	mounted() {
		this.initPaper()
	},
	methods: {
		initPaper() {
			this.canvas = document.getElementById('paper')
			this.canvas.width = window.innerWidth - 120
			// console.log('this.canvas =', this.canvas)
			this.ctx = this.canvas.getContext('2d')
			// this.canvas.addEventListener('mousedown', this.dragStart, false)
			// this.canvas.addEventListener('mousemove', this.drag, false)
			// this.canvas.addEventListener('mouseup', this.dragStop, false)
			this.canvas.addEventListener('touchstart', this.touchStart, false)
			this.canvas.addEventListener('touchmove', this.touch, false)
			this.canvas.addEventListener('touchend', this.touchEnd, false)
		},
		touchStart(event) {
			if (this.isEraser) {
				this.ctx.strokeStyle = 'white'
				this.ctx.lineWidth = 20
				this.ctx.lineCap = 'round'
			} else {
				this.ctx.strokeStyle = 'purple'
				this.ctx.lineWidth = 2
				this.ctx.lineCap = 'round'
			}
			// start new
			this.ctx.beginPath()
			// this.ctx.moveTo(event.touches[0].pageX, event.touches[0].pageY)
			this.started = true
			const x =
				event.touches[0].pageX -
				this.canvas.getBoundingClientRect().left -
				window.scrollX
			const y =
				event.touches[0].pageY -
				this.canvas.getBoundingClientRect().top -
				window.scrollY
			this.ctx.moveTo(x, y)
			this.savePoint(x, y)
		},
		touch(event) {
			event.preventDefault() // otherwise iPad will think that the user intends to scroll the page
			if (this.started) {
				this.DEBUG = {
					eventTouches: event.touches[0],
					x: event.touches[0].pageX,
					y: event.touches[0].pageY,
					left: this.canvas.getBoundingClientRect().left,
					top: this.canvas.getBoundingClientRect().top,
					windowX: window.scrollX,
					windowY: window.scrollY
				}
				const x =
					event.touches[0].pageX -
					this.canvas.getBoundingClientRect().left -
					window.scrollX
				const y =
					event.touches[0].pageY -
					this.canvas.getBoundingClientRect().top -
					window.scrollY
				this.ctx.lineTo(x, y)
				this.ctx.stroke()
				this.savePoint(x, y)
			}
		},
		touchEnd(event) {
			this.DEBUG = 'Touch Ended'
			const x =
				event.changedTouches[0].pageX -
				this.canvas.getBoundingClientRect().left -
				window.scrollX
			const y =
				event.changedTouches[0].pageY -
				this.canvas.getBoundingClientRect().top -
				window.scrollY
			this.ctx.lineTo(x, y)
			this.ctx.stroke()
			this.savePoint(x, y)
			this.started = false
			// save current path, and then reset it
			const pathObject = {
				author: 'Mother Fucker',
				isEraser: this.isEraser,
				points: this.currentPath
			}
			this.allPaths.push(pathObject)
			this.currentPath = []
		},
		dragStart(event) {
			this.dragging = true
			if (this.isEraser) {
				this.ctx.strokeStyle = 'white'
				this.ctx.lineWidth = 10
				this.ctx.lineCap = 'round'
			} else {
				this.ctx.strokeStyle = 'purple'
				this.ctx.lineWidth = 3
				this.ctx.lineCap = 'round'
			}
			this.dragStartLocation = this.getCanvasCoordinates(event)
			this.savePoint(this.dragStartLocation.x, this.dragStartLocation.y)
		},
		drag(event) {
			if (this.dragging) {
				const position = this.getCanvasCoordinates(event)
				this.drawLine(position)
				this.savePoint(position.x, position.y)
			}
		},
		dragStop(event) {
			this.dragging = false
			const position = this.getCanvasCoordinates(event)
			this.drawLine(position)
			// store current path
			this.savePoint(position.x, position.y)
			const pathObject = {
				author: this.user.uid,
				isEraser: this.isEraser,
				points: this.currentPath
			}
			this.allPaths.push(pathObject)
			this.currentPath = []
		},
		savePoint(X, Y) {
			const unitPoint = {
				x: Number((X / this.canvas.width).toFixed(3)),
				y: Number((Y / this.canvas.height).toFixed(3))
			}
			this.currentPath.push(unitPoint)
		},
		getCanvasCoordinates(event) {
			const x = event.clientX - this.canvas.getBoundingClientRect().left
			const y = event.clientY - this.canvas.getBoundingClientRect().top
			return { x: x, y: y }
		},
		drawLine(position) {
			this.ctx.beginPath()
			this.ctx.moveTo(this.dragStartLocation.x, this.dragStartLocation.y)
			this.ctx.lineTo(position.x, position.y)
			this.ctx.stroke()
			// update the latest location
			this.dragStartLocation.x = position.x
			this.dragStartLocation.y = position.y
		},
		async resetBoard() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
			this.allPaths = []
		}
	}
}
</script>

<style lang="scss" scoped>
canvas {
	background: white;
}
</style>
