<template>
 <button @click="$emit('click')">EUREKA</button>
</template>

<style scoped lang="scss">
$brand: rgb(203, 4, 4);
body {
  margin: 2em;
  text-align:center;
}
button {
  font-size: 40px;
  padding: 1em;
  border: 0;
  background: $brand;
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

</style>