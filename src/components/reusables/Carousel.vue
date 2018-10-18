<template>
  <div class="carousel">
    <a class="carousel-item"><slot name="first"></slot></a>
    <a class="carousel-item"><slot name="second"></slot></a>
    <a class="carousel-item"><slot name="third"></slot></a>
    <!-- <a class="carousel-item"><img src="https://lorempixel.com/250/250/nature/5"></a> -->
  </div>
</template>

<script>
export default {
	mounted() {
		let elems = document.querySelectorAll('.carousel')
		const options = {
			dist: -30
		}
		let instances = M.Carousel.init(elems, options)
	}
}
</script>