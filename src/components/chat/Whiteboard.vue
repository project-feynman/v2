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

export default {
	props: ['isEraser'],
	data() {
		return {
			tool: null,
			whiteboard: null,
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
		this.tool = new paper.Tool()
		// the mouse has to move 10 before the next onMouseDrag is called
		this.tool.minDistance = 1
		this.tool.onMouseDown = event => {
			// get access to height
			// get access to width
			PATH = new Path()
			if (this.isEraser) {
				PATH.strokeColor = 'white'
				PATH.strokeWidth = 30
			} else {
				PATH.strokeColor = 'black'
				PATH.strokeWidth = STROKE_WIDTH
			}
			PATH.strokeCap = 'round'
			PATH.strokeJoin = 'round'
			PATH.add(event.point)
		}
		this.tool.onMouseDrag = event => {
			PATH.add(event.point)
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
			} else {
				const updatedPaths = data.allPaths
				const n = updatedPaths.length
				if (n == 0) {
					project.activeLayer.removeChildren()
				} else if (updatedPaths[n - 1].author == this.user.uid) {
					return
				} else {
					const newPath = updatedPaths[n - 1]
					let whiteboardPath = new Path()
					if (newPath.isEraser) {
						whiteboardPath.strokeColor = 'white'
						whiteboardPath.strokeWidth = 30
					} else {
						whiteboardPath.strokeColor = 'green'
					}
					newPath.points.forEach(point => {
						whiteboardPath.add(new Point(point.x, point.y))
					})
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
			if (!this.whiteboard) {
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
			})
			this.loadedPreviousDrawings = true
		},
		initOnMouseUp() {
			this.onMouseUpInitialized = true
			this.tool.onMouseUp = async event => {
				PATH.add(event.point) // make sure the end is the end
				PATH.simplify(0.5)
				const segments = PATH.getSegments()
				// create the path object that the user has just drawn
				let pathObj = {}
				let points = []
				segments.forEach(segment => {
					let point = {}
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
