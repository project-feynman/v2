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

async function startApp () {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
  // by the way, can we put dispatch here? otherwise the initial app rendering will be slow
  // because the app only starts rendering when user has been fetched
  // I ensured that rendering the app and fetching the user rans in parallel so it's faster for the user okay 
  const user = await store.dispatch('fetchUser')
  console.log(`user = ${user}`)
  console.log(`store.state.user = ${store.state.user}`)
}

startApp()

// actually, I think I want to go with solution 1 because it's a good idea to separate the user logic into the store
// instead of inside some components 
// as you wish, but it sounds like a worse one

// in fact, right now the only purpose of Vuex is to centralize user logic, let me use a bit of brain power to correct
// the function in store/index.js

// meanwhile, are you able to look into other things or is this blocking your progress 

// store.state is returning the correct thing
// I looked at the user property of the object and that seems correct too 
// we can access it directly we don't need a getter for this simple case 
// ah, let me look in store let's go there store/index.js

// i found the problem I think - we on

// i already did that, you can access store.state.user
// it is a "Getter"
// yup, but it's undetermined
//ohhh i didnt think had to

// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app')

