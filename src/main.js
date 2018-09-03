import Vue from 'vue'
import VueFire from 'vuefire'
import VueResource from 'vue-resource'
import firebase from 'firebase/app'
import 'firebase/messaging'
import VueChatScroll from 'vue-chat-scroll'

import App from './App.vue'
import router from './router'
import store from './store/index.js'
//import './registerServiceWorker'
import '@/components/reusables/_globals.js'
import { askForPermissionToReceiveNotifications, sendNotification } from './push_notifications/push_notifications.js'

if('Notification' in window && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then(async registration => {
      firebase.messaging().useServiceWorker(registration)
      console.log(await firebase.messaging().getToken())
      console.log('service worker registered')
       askForPermissionToReceiveNotifications()
     })
     .catch(error => console.log('error =', error))
  console.log('Notifications supported')
}
else {
  console.log('Notifications not supported')
}

Vue.use(VueChatScroll)
Vue.use(VueResource)
Vue.use(VueFire)
Vue.use(router)


Vue.config.productionTip = false

const dispatch = async () => { await store.dispatch('fetchUser') } // purposely omit using 'await' so App renders in parallel 
dispatch()
console.log(store.state.user)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

