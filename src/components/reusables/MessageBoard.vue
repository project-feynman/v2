<template>
  <div class="card">
    <div class="card-content">
      <ul class="messages" v-chat-scroll>
        <li v-for="message in messages" :key="message.id">
          <span class="teal-text">{{ message.author.displayName }}: </span>
          <span class="grey-text text-darken-3">{{ message.content }}</span>
          <span class="grey-text time">{{ prettifyDate(message.timestamp) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  props: ['messages'],
  methods: {
    prettifyDate (timestamp) {
      return moment(timestamp).format("lll")
    }
  }
}
</script>

<style scoped>
span {
  font-size: 1.4em;
}

.time {
  display: block;
  font-size: 0.8em;
}

.messages {
  max-height: 300px;
  overflow: auto;
}

.messages::-webkit-scrollbar {
  width: 3px;
}

.messages::-webkit-scrollbar-track {
  background: #ddd;
}

.messages::-webkit-scrollbar-thumb {
  background: #aaa;
}
</style>

