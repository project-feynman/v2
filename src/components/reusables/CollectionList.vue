<template>
  <div v-if="listItems">
    <ul class="collection with-header">
      <li class="collection-header">
        <h6>{{ title }}</h6>
      </li>
      <template v-for="(item, idx) in listItems">
        <a @click="$emit('entire-click', item)" class="collection-item" :key="idx">
          <div>
            <slot :item="item">
              <!-- Fallback content -->
              {{ item }}
            </slot>
            <template v-if="actionIcon">
              <a @click.stop="$emit('item-click', item)" class="secondary-content">
                <i class="material-icons">{{ actionIcon }}</i>
              </a>
            </template>
          </div>
        </a>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    listItems: Array,
    itemName: String,
    actionIcon: String
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
