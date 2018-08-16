<template>
  <form>
    <p>
      <label>
        <input :checked="value"
              @click="$emit('toggle', !value)"
              type="checkbox"/>
        <span>
          <slot>
            
          </slot>
        </span>
      </label>
    </p>
  </form>
</template>

<script>
export default {
  props: ['value']
}
</script>
