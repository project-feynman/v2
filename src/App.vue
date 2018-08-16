<template>
  <div id="app">
    <the-navbar/>
    <router-view/>
  </div>
</template>

<script>
import store from '@/store/store.js'
import TheNavbar from '@/components/TheNavbar.vue'
import M from 'materialize-css'

export default {
  name: 'App',
  store, // injects Vuex to all children
  components: {
    TheNavbar
  }
}
</script>

<style lang="sass">
$primary-color: color("materialize-red", "lighten-2") !default;
$primary-color-light: false !default;
$primary-color-dark: false !default;
</style>

<style>
h2, h3, h4, h4, p, div, span, input {
  color: white;
}

body {
  background-color: #41403F;
}
</style>
