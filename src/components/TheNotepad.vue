<template>
  <canvas id="notepad"></canvas>
</template>

<script>
import paper from 'paper'

export default {
	data() {
		return {
			paperScope: null
		}
	},
	mounted() {
		let notepad = document.getElementById('notepad')

		paper.setup(notepad) // create an empty project and view for the canvas
		console.log('paper.projects =', paper.projects)
		console.log('scope id =', paper)
		// draw path
		let path = new paper.Path()
		path.strokeColor = 'pink'
		let start = new paper.Point(100, 100)
		let end = new paper.Point(300, 300)
		path.add(start)
		path.add(end)
		paper.view.draw()

		this.paper = new paper.PaperScope()
		this.paper.activate()
		console.log('new paper =', paper.paper)
	}
}
</script>

<style scoped lang="scss">
canvas {
	width: 500px;
	height: 650px;
	background: white;
}
</style>