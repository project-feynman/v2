<template>
  <div class="row">
    <div class="col s12">
      <div class="row">
        <div class="input-field col s12">
          <i class="material-icons prefix">textsms</i>
          <input type="text" id="autocomplete-input" class="autocomplete">
          <label for="autocomplete-input">Search Friend</label>
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
        data: this.allResults,
        onAutocomplete: this.handleResultSelect
      }
      var instances = M.Autocomplete.init(elems, options)
    }
  },
  methods: {
    handleResultSelect (payload) {
      this.$emit('select', payload)
    },
  }
}
</script>
