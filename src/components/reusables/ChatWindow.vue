<template>
  <div class="card">
    <div class="card-content">
      <ul class="messages" v-chat-scroll>
        <li v-for="message in messages" :key="message.id">
          <span class="teal-text">{{ message.author }}: </span>
          <span class="grey-text text-darken-3">{{ message.content }}</span>
          <span class="grey-text time">{{ prettifyDate(message.timestamp) }}</span>
        </li>
        <li>
          <span class="grey-text time"> 
            <!-- <template v-if="chatroom.whoIsTyping">
              <template v-if="Object.keys(chatroom.whoIsTyping).length > 0">{{Object.keys(chatroom.whoIsTyping).map(key => chatroom.whoIsTyping[key]).join(", ")}} is typing...</template> 
            </template> -->
          </span>              
        </li>
      </ul>
    </div>
    <div class="card-action">
      <div class="new-message">
        <form autocomplete="off" @submit.prevent="addMessage">
          <label for="new-message">Write a new message below...</label>
          <input type="text" name="new-message" v-model="newMessage">
        </form>
      </div>
      <chat-new-message :participants="participants"/>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ChatNewMessage from '@/components/chat/ChatNewMessage.vue'

export default {
  props: ['messages'],
  data () {
    return {
      participants: ['Elton', 'John', 'Qiantan']
    }
  },
  methods: {
    prettifyDate (timestamp) {
      return moment(timestamp).format("lll")
    }
  }
}
</script>

<style scoped lang="scss">
h2 {
  @extend .center;
}

.button-wrapper {
  margin: auto;
}

span {
  font-size: 1.4em;
}

.time {
  display: block;
  font-size: 0.8em;
}

.whiteboard-wrapper {
  width: 50%;
  height: 484px;
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

.user-online {
  font-size: 10px; 
  color: #4aba34;
}
</style>