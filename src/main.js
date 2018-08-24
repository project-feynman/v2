import Vue from 'vue'
import VueFire from 'vuefire'
import VueResource from 'vue-resource'
import firebase from 'firebase'
import VueChatScroll from 'vue-chat-scroll'

import App from './App.vue'
import router from './router'
import store from './store/index.js'
import './registerServiceWorker'
import '@/components/reusables/_globals.js'
import { askForPermissionToReceiveNotifications, sendNotification } from './push_notifications/push_notifications.js'

Vue.use(VueChatScroll)
Vue.use(VueResource)
Vue.use(VueFire)
Vue.use(router)

navigator.serviceWorker
  .register('/firebase-messaging-sw.js')
  .then(registration => {
    firebase.messaging().useServiceWorker(registration)
    console.log('service worker registered')
    askForPermissionToReceiveNotifications()
  })
  .catch(error => console.log('error =', error))

Vue.config.productionTip = false

/* eslint-disable no-new */

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
// trigger Vuex actions in parallel for better performance
store.dispatch('fetchUser')
