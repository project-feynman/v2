<template>
  <div class="col s12 m7">
    <div @click="$emit('click')" class="card horizontal">
      <div class="card-stacked">
        <div class="card-content">
          <slot></slot>
        </div>
        <slot name="action"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Have border radius be proportional to the size of the card */
.card {
  border-radius: 5px;
}
</style>

