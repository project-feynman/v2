<template>
  <div>
    <div>{{ whiteboard }}</div>
    <canvas id="paper" width="1000" height="1200"/>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
import paper from 'paper'
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
			dragStartLocation: null
		}
	},
	computed: {
		...mapState(['user', 'hasFetchedUser'])
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
	async created() {
		const roomID = this.$route.params.room_id
		console.log('roomID =', roomID)
		const ref = db.collection('whiteboards').doc(roomID)
		await this.$bind('whiteboard', ref)
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
			this.canvas.width = window.innerWidth - 120
			this.ctx = this.canvas.getContext('2d')
			this.canvas.addEventListener('mousedown', this.dragStart, false)
			this.canvas.addEventListener('mousemove', this.drag, false)
			this.canvas.addEventListener('mouseup', this.dragStop, false)
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
			this.ctx.lineTo(x, y)
			this.ctx.stroke()
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
			// save current path, and then reset it
			const pathObject = {
				author: this.user.uid,
				isEraser: this.isEraser,
				points: this.currentPath
			}
			this.allPaths.push(pathObject)
			this.currentPath = []
		},
		dragStart(event) {
			// listen to ends
			// mouse strt should't do anything
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
			// source of Truth is constantly synced
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


</template>