<template>
  <div>
    <canvas :id="id" resize></canvas>
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
var PREV_X = null
var PREV_Y = null
var PREV_RECORDED = false

export default {
	props: ['isEraser'],
	data() {
		return {
			whiteboard: null,
			numOfPaths: 0,
			loadedPreviousDrawings: false,
			onMouseUpInitialized: false,
			id: null
		}
	},
	created() {
		paper.install(window)
		this.id = 'awb' + this.uid
	},
	computed: {
		...mapState(['user', 'hasFetchedUser'])
	},
	watch: {
		user() {
			if (this.user && this.hasFetchedUser) {
				if (!this.onMouseUpInitialized) {
					this.initOnMouseUp()
				}
			}
		}
	},
	mounted() {
		paper.setup(this.id)
		var tool = new Tool()
		tool.onMouseDown = event => {
			PATH = new Path()
			if (this.isEraser) {
				console.log('eraser')
				PATH.strokeColor = 'white'
				PATH.strokeWidth = 30
			} else {
				console.log('pen')
				PATH.strokeColor = 'black'
				PATH.strokeWidth = STROKE_WIDTH
			}
			PATH.strokeCap = 'round'
			PATH.strokeJoin = 'round'
			PATH.add(event.point)
			PREV_X = event.point.x
			PREV_Y = event.point.y
			PREV_RECORDED = true
		}

		tool.onMouseDrag = event => {
			var s = PATH.getSegments()
			var ep = event.point
			var dx = ep.x - PREV_X
			var dy = ep.y - PREV_Y
			if (dx * dx + dy * dy > 10) {
				PREV_X = ep.x
				PREV_Y = ep.y
				PREV_RECORDED = true
				PATH.add(event.point)
			} else {
				if (!PREV_RECORDED) {
					PATH.removeSegment(s.length - 1)
				}
				PATH.add(event.point)
				PREV_RECORDED = false
			}
		}
		if (this.user && this.hasFetchedUser) {
			if (!this.onMouseUpInitialized) {
				this.initOnMouseUp()
			}
		}
		// sync whiteboard to Firestore
		const roomID = this.$route.params.room_id
		const ref = db.collection('whiteboards').doc(roomID)
		ref.onSnapshot(doc => {
			const data = doc.data()
			this.whiteboard = data
			if (!this.loadedPreviousDrawings) {
				// initial load
				this.drawAllPaths()
				this.numOfPaths = this.whiteboard.allPaths.length
			} else {
				const updatedPaths = data.allPaths
				const n = updatedPaths.length
				// probably means user's board is outdated
				if (n >= this.numOfPaths) {
					this.numOfPaths = n
					const newestPath = updatedPaths[n - 1]
					if (newestPath.author == this.user.uid) {
						return
					}
					let whiteboardPath = new Path()
					if (newestPath.isEraser) {
						whiteboardPath.strokeColor = 'white'
						whiteboardPath.strokeWidth = 30
					} else {
						whiteboardPath.strokeColor = 'green'
					}
					newestPath.points.forEach(point => {
						whiteboardPath.add(new Point(point.x, point.y))
					})
				} else {
					this.numOfPaths = n // probably means board has been reset
					project.activeLayer.removeChildren()
				}
			}
		})
	},
	methods: {
		async resetBoard() {
			const roomID = this.$route.params.room_id
			const ref = db.collection('whiteboards').doc(roomID)
			await ref.update({
				allPaths: []
			})
		},
		drawAllPaths() {
			console.log('drawAllPaths()')
			if (this.whiteboard == null) {
				return
			}
			this.whiteboard.allPaths.forEach(stroke => {
				let path = new Path()
				if (stroke.isEraser) {
					path.StrokeColor = 'white'
					path.strokeWidth = 30
				} else {
					path.strokeColor = 'pink'
					path.strokeWidth = STROKE_WIDTH
				}
				stroke.points.forEach(p => {
					path.add(new Point(p.x, p.y))
				})
				// path.smooth()
			})
			this.loadedPreviousDrawings = true
		},
		initOnMouseUp() {
			this.onMouseUpInitialized = true
			tool.onMouseUp = async event => {
				// PATH.add(event.point)
				PATH.simplify()
				// const segments = this.path.getSegments()
				const segments = PATH.getSegments()
				// save the "path" that the user has just drawn
				var pathObj = {}
				var points = []
				segments.forEach(segment => {
					var point = {}
					point.x = segment.point.x
					point.y = segment.point.y
					points.push(point)
				})
				pathObj.points = points
				pathObj.author = this.user.uid
				pathObj.isEraser = this.isEraser

				// update the whiteboard
				const roomID = this.$route.params.room_id
				const ref = db.collection('whiteboards').doc(roomID)
				ref.update({
					allPaths: firebase.firestore.FieldValue.arrayUnion(pathObj)
				})
				PATH = null
			}
			// console.log('view.onFrame =', project)
		}
	}
}
</script>

<style lang="scss" scoped>
canvas {
	height: 484px;
	width: 100%;
	background: white;
}
</style>
