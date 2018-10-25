<template>
  <div class="carousel">
    <a class="carousel-item"><slot name="first"></slot></a>
    <a class="carousel-item"><slot name="second"></slot></a>
    <a class="carousel-item"><slot name="third"></slot></a>
  </div>
</template>

<script>
export default {
	mounted() {
		const elems = document.querySelectorAll('.carousel')
		const options = {
			dist: -30
		}
		M.Carousel.init(elems, options)
	}
}
</script>