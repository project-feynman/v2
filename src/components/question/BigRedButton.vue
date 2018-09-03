<template>
  <div class="big-red-button">
    <button @click="$emit('click')"
            class="tooltipped" 
            data-tooltip =
              "If you want to help someone, press the button">
      EUREKA
    </button>
  </div>
</template>

<script>
export default {
  mounted () {
    const elems = document.querySelectorAll('.tooltipped')
    var instances = M.Tooltip.init(elems)
  }
}

</script>

<style scoped lang="scss">
$brand: rgb(203, 4, 4);

// Materialize's global import messes the styles, so we do this instead
.big-red-button {

  body {
    margin: 2em;
    text-align:center;
  }
  
  button {
    font-size: 40px;
    padding: 1em;
    border: 0;
    background: $brand;
    background-color: $brand;
    color: white;
    line-height: 1.4;
    border-radius: 50%;
    height: 6em;
    width: 6em;
    box-shadow: 0 .2em 0 darken($brand,10%);
    position: relative;
    top: 0;
    transition: all .1s ease-in-out;
    outline: none;
    font-weight: bold;
    &:hover {
      top: -.1em;
      box-shadow: 0 .3em 0 darken($brand,10%);
    }
    &:active {
      top: .2em;
      box-shadow: 0 .1em 0 darken($brand,10%);
    }
  }
}



</style>