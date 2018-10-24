<template>
  <div>
    <!-- Touched  -->
    <p>All paths = {{ allPaths }}</p>
    <p>Whiteboard offset = {{ offset }}</p> 
    <p>Touch location = {{ touchLocation }}</p> 
    <canvas id="paper" width="1000" height="500"/>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
import paper from 'paper'
import { version } from 'moment'
import db from '@/firebase/init.js'
import { mapState } from 'vuex'

var PATH = null
var STROKE_WIDTH = 2
var CURRENT_PATH = []
var mouseIsDown = false

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
			paperInitialized: false,
			offset: null,
			touchLocation: null
		}
	},
	computed: {
		...mapState(['user', 'hasFetchedUser'])
	},
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
		// if (this.user && this.hasFetchedUser) {
		// 	if (!this.onMouseUpInitialized) {
		// 		this.initOnMouseUp()
		// 	}
		// }
		// sync whiteboard to Firestore
		// const roomID = this.$route.params.room_id
		// const ref = db.collection('whiteboards').doc(roomID)
		// ref.onSnapshot(doc => {
		// 	const data = doc.data()
		// 	this.whiteboard = data
		// 	if (!this.loadedPreviousDrawings) {
		// 		// initial load
		// 		this.drawAllPaths()
		// 	} else {
		// 		const updatedPaths = data.allPaths
		// 		const n = updatedPaths.length
		// 		if (n == 0) {
		// 			// wipe whiteboard
		// 		} else if (updatedPaths[n - 1].author == this.user.uid) {
		// 			return
		// 		} else {
		// 			const newPath = updatedPaths[n - 1]
		//      this.drawPath()
		// 		}
		// 	}
		// })
	},
	methods: {
		initPaper() {
			this.canvas = document.getElementById('paper')
			this.ctx = this.canvas.getContext('2d')
			this.canvas.addEventListener('mousedown', this.dragStart, false)
			this.canvas.addEventListener('mousemove', this.drag, false)
			this.canvas.addEventListener('mouseup', this.dragStop, false)
			this.canvas.addEventListener('touchstart', this.touchStart, false)
			this.canvas.addEventListener('touchmove', this.touch, false)
			this.canvas.addEventListener('touchend', this.touchEnd, false)
			this.paperInitialized = true
		},
		touchStart(event) {
			if (this.isEraser) {
				this.ctx.strokeStyle = 'white'
				this.ctx.lineWidth = 20
				this.ctx.lineCap = 'round'
			} else {
				this.ctx.strokeStyle = 'purple'
				this.ctx.lineWidth = 3
				this.ctx.lineCap = 'round'
			}
			// save previous point
			this.allPaths.push(this.currentPath)
			this.currentPath = []
			// start new
			this.ctx.beginPath()
			const x =
				event.changedTouches[0].pageX -
				this.canvas.getBoundingClientRect().left -
				window.scrollX
			const y =
				event.changedTouches[0].pageY -
				this.canvas.getBoundingClientRect().top -
				window.scrollY
			this.ctx.moveTo(x, y)
			this.touchLocation = { x: x, y: y }
			this.savePoint(x, y)
		},
		touch(event) {
			event.preventDefault() // otherwise iPad will think that the user intends to scroll the page
			const x =
				event.changedTouches[0].pageX -
				this.canvas.getBoundingClientRect().left -
				window.scrollX
			const y =
				event.changedTouches[0].pageY -
				this.canvas.getBoundingClientRect().top -
				window.scrollY
			this.offset = this.canvas.getBoundingClientRect().top
			this.ctx.lineTo(x, y)
			this.ctx.stroke()
			this.touchLocation = { x: x, y: y }
			this.savePoint(x, y)
		},
		touchEnd(event) {
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
			// store current path
			this.savePoint(x, y)
			// reset current path, and store it to allPaths
			const pathObject = {
				author: this.user.uid,
				isEraser: this.isEraser,
				points: this.currentPath
			}
			this.allPaths.push(this.pathObject)
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
      console.log('# of points =', this.currentPath.length)
      console.log('this.user =', this.user)
			const pathObject = {
				author: this.user.uid,
				isEraser: this.isEraser,
				points: this.currentPath
			}
			this.allPaths.push(pathObject)
			console.log('# of paths =', this.allPaths.length)
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
			// const roomID = this.$route.params.room_id
			// const ref = db.collection('whiteboards').doc(roomID)
			// await ref.update({
			// 	allPaths: []
			// })
		},
		drawAllPaths() {
			//
		},
		drawPath() {
			// 	if (stroke.isEraser) {
			// 		path.StrokeColor = 'white'
			// 		path.strokeWidth = 30
			// 	} else {
			// 		path.strokeColor = 'pink'
			// 		path.strokeWidth = STROKE_WIDTH
			// 	}
			// 	const height = this.height
			// 	const width = this.width
			// 	stroke.points.forEach(p => {
			// 		path.add(new paper.Point(p.x * width, p.y * height))
			// 	})
			// 	path.smooth()
			return
		}
		// author
		// points
		// isEraser
	}
}
</script>

<style lang="scss" scoped>
canvas {
	background: white;
}
</style>
