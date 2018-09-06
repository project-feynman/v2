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
  mounted () {
    var elems = document.querySelectorAll('.autocomplete');
    const options = {
      data: {
        "Apple": null,
        "Microsoft": null,
        "Google": 'https://placehold.it/250x250'
      }
    }
    var instances = M.Autocomplete.init(elems, options)
  }
}
</script>
