<template>
  <a @click="$emit('click')" :class="`waves-effect waves-light btn ${buttonColor} ${textColor}`">
    <slot>

    </slot>
  </a>
</template>

<script>
export default {
  props: {
    buttonColor: {
      default () {
        return 'teal'
      },
      type: String 
    },
    textColor: {
      default () {
        return 'white-text'
      },
      type: String 
    }
  }
}
</script>