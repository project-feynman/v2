import Vue from 'vue'
import VueFire from 'vuefire'
import VueResource from 'vue-resource'
import firebase from 'firebase'
import VueChatScroll from 'vue-chat-scroll'

import App from './App.vue'
import router from './router'
import store from './store/store.js'
import './registerServiceWorker'
import '@/components/_globals.js'
import { askForPermissionToReceiveNotifications, sendNotification } from './push_notifications/push_notifications.js'

Vue.use(VueChatScroll)
Vue.use(VueResource)
Vue.use(VueFire)
Vue.use(router)

navigator.serviceWorker
  .register('/firebase-messaging-sw.js')
  .then(registration => {
    firebase.messaging().useServiceWorker(registration)
    console.log('Registered!')
    askForPermissionToReceiveNotifications()
    setTimeout(sendNotification, 3000, "Hello", "hello")
    console.log('Theoretically a notifcaiton should be received')
  })

Vue.config.productionTip = false
  })

Vue.config.productionTip = false


/* eslint-disable no-new */

// new Vue({
// 	router,
// 	store,
// 	render: h => h(App)
// }).$mount('#app')

// render app only after user's login state is calculated
var app = null
firebase.auth().onAuthStateChanged(async () => {
  if (!app) {
    await store.dispatch('setUser')
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  }
})
