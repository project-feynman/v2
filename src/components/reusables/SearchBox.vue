<template>
  <div class="row">
    <div class="col s12">
      <div class="row">
        <div class="input-field col s12">
          <i class="material-icons prefix">textsms</i>
          <input type="text" id="autocomplete-input" class="autocomplete">
          <label for="autocomplete-input">Autocomplete</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    allResults: Object
  },
  mounted () {
    if (this.allResults) {
      var elems = document.querySelectorAll('.autocomplete')
      const options = {
        data: this.allResults 
      }
      // const options = {
      //   data: {
      //     "Apple": null,
      //     "Microsoft": null,
      //     "Google": 'https://placehold.it/250x250'
      //   }
      // }
      console.log(`options = ${JSON.stringify(options)}`)
      var instances = M.Autocomplete.init(elems, options)
      console.log(`initialized instances`)
    }
  }
}
</script>
