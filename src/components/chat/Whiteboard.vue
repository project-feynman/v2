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
			id: null,
			width: 0,
			height: 0
		}
	},
	created() {
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
		this.width = paper.project.view.viewSize.width
		this.height = paper.project.view.viewSize.height
		paper.project.view.onResize = function(event) {
			this.width = event.size.width
			this.height = event.size.height
		}
		this.tool = new paper.Tool()
		// this.tool.minDistance = 0.01
		this.tool.maxDistance = 1
		this.tool.onMouseDown = event => {
			PATH = new paper.Path()
			PATH.strokeCap = 'round'
			PATH.strokeJoin = 'round'
			if (this.isEraser) {
				PATH.strokeColor = 'white'
				PATH.strokeWidth = 30
			} else {
				PATH.strokeColor = 'black'
				PATH.strokeWidth = STROKE_WIDTH
			}
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
					paper.project.activeLayer.removeChildren()
				} else if (updatedPaths[n - 1].author == this.user.uid) {
					return
				} else {
					const newPath = updatedPaths[n - 1]
					let whiteboardPath = new paper.Path()
					if (newPath.isEraser) {
						whiteboardPath.strokeColor = 'white'
						whiteboardPath.strokeWidth = 30
					} else {
						whiteboardPath.strokeColor = 'green'
					}
					newPath.points.forEach(point => {
						whiteboardPath.add(new paper.Point(point.x, point.y))
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
				let path = new paper.Path()
				path.strokeCap = 'round'
				path.strokeJoin = 'round'
				if (stroke.isEraser) {
					path.StrokeColor = 'white'
					path.strokeWidth = 30
				} else {
					path.strokeColor = 'pink'
					path.strokeWidth = STROKE_WIDTH
				}
				const height = this.height
				const width = this.width
				stroke.points.forEach(p => {
					path.add(new paper.Point(p.x * width, p.y * height))
				})
				path.smooth()
			})
			this.loadedPreviousDrawings = true
		},
		initOnMouseUp() {
			this.onMouseUpInitialized = true
			this.tool.onMouseUp = async event => {
				PATH.add(event.point) // make sure the end is the end
				PATH.smooth() // smooth's the drawer's whiteboard
				console.log('initial path length =', PATH.segments.length)
				PATH.simplify(0.2)
				console.log('simplified path length =', PATH.segments.length)
				const segments = PATH.getSegments()
				// create the path object that the user has just drawn
				let pathObj = {}
				let points = []
				segments.forEach(segment => {
					const unitPoint = {
						x: segment.point.x / this.width,
						y: segment.point.y / this.height
					}
					points.push(unitPoint)
				})
				console.log('# of points =', points.length)
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
	height: 800px;
	width: 100%;
	background: white;
}
</style>
