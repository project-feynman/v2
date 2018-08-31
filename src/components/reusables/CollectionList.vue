<template>
  <div v-if="listItems">
    <ul class="collection with-header">
      <li class="collection-header">
        <h6>Classmates doing this question right now</h6>
      </li>
      <li v-for="(item, idx) in listItems"
          class="collection-item"
          :key="idx">
        <div>
          Feynman #{{ item.feynmanNumber }}
          <a @click="$emit('item-click', item)" 
             class="secondary-content">
            <i class="material-icons">send</i>
          </a>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    listItems: Array
  }
}
</script>

<style lang="scss" scoped>
h6 {
  @extend .teal-text;
}

p, div {
  @extend .black-text;
}
</style>
