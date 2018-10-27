<template>
  <div>
    <div v-show="isDebugging">{{ whiteboard }}</div>
    <base-button @click="clearBoard">Clear Board</base-button>
    <base-button @click="isDebugging = !isDebugging">Debug mode</base-button>
    <div>
      <canvas id="whiteboard" width="1000" height="1200"/>
    </div>
  </div>
</template>

<script>
// implement the online functionalities to the iPad too

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
			loadSavedDrawing: false,
			id: null,
			width: 0,
			height: 0,
			currentPath: [],
			allPaths: [],
			canvas: null,
			ctx: null,
			dragging: false,
			dragStartLocation: null,
			roomID: null,
			isDebugging: false
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
		this.roomID = this.$route.params.room_id
		this.ref = db.collection('whiteboards').doc(this.roomID)
		await this.$bind('whiteboard', this.ref)
	},
	mounted() {
		this.initWhiteboard()
		this.ref.onSnapshot(doc => {
			this.whiteboard = doc.data()
			const n = this.whiteboard.allPaths.length
			const newPath = this.whiteboard.allPaths[n - 1]
			if (!this.loadSavedDrawing) {
				for (let i = 0; i < n; i++) {
					const path = this.whiteboard.allPaths[i]
					this.drawPath(path)
				}
				this.loadSavedDrawing = true
			} else if (n == 0) {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
			} else if (newPath.author == this.user.uid) {
				return
			} else {
				this.drawPath(newPath)
			}
		})
	},
	methods: {
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
		},
		initWhiteboard() {
			this.canvas = document.getElementById('whiteboard')
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
		async touchEnd(event) {
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
			await this.ref.update({
				allPaths: firebase.firestore.FieldValue.arrayUnion(pathObject)
			})
			this.currentPath = []
		},
		dragStart(event) {
			// listen to ends
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
		async dragStop(event) {
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
			await this.ref.update({
				allPaths: firebase.firestore.FieldValue.arrayUnion(pathObject)
			})
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
		async clearBoard() {
			await this.ref.update({
				allPaths: []
			})
		}
	}
}
</script>

<style lang="scss" scoped>
canvas {
	background: white;
}
</style>