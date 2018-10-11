<template>
  <canvas id="notepad"></canvas>
</template>

<script>
import paper from 'paper'

export default {
	mounted() {
		let notepad = document.getElementById('notepad')
		paper.setup(notepad) // create an empty project and view for the canvas
		console.log('paper.projects =', paper.projects)
		// draw path
		let path = new paper.Path()
		path.strokeColor = 'pink'
		let start = new paper.Point(100, 100)
		let end = new paper.Point(300, 300)
		path.add(start)
		path.add(end)
		paper.view.draw()
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