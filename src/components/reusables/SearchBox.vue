<template>
  <div class="row">
    <div class="col s12">
      <div class="row">
        <div class="input-field col s12">
          <i class="material-icons prefix">search</i>
          <input type="text" id="autocomplete-input" class="autocomplete">
          <label for="autocomplete-input">{{ label }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default () {
        return 'Search Friend'
      }
    },
    allResults: Object
  },
  watch: {
    allResults () {
      this.putDataInSearchbox()
    }
  },
  mounted () {
    this.putDataInSearchbox()
  },
  methods: {
    handleResultSelect (payload) {
      this.$emit('select', payload)
    },
    putDataInSearchbox () {
      if (this.allResults) {
        var elems = document.querySelectorAll('.autocomplete')
        const options = {
          data: this.allResults,
          onAutocomplete: this.handleResultSelect,
          minLength: 0
        }
        var instances = M.Autocomplete.init(elems, options)
      }
    }
  }
}
</script>
