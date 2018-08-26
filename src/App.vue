<template>
  <div id="app">
    <the-navbar/>
    <router-view/>
  </div>
</template>

<script>
import store from '@/store/index.js'
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

<style>
/* default global styles */
h2, h3, h4, h4, p, div, span, input {
  color: white;
}

body {
  background-color: #41403F;
}
</style>
