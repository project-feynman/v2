import Vue from 'vue'
import VueFire from 'vuefire'
import firebase from 'firebase/app'
// import 'firebase/messaging'
import VueChatScroll from 'vue-chat-scroll'

import App from './App.vue'
import router from './router.js'
import store from './store/index.js'
//import './registerServiceWorker'
import '@/components/reusables/_globals.js'
import '@/api/push_notifications.js'

Vue.use(VueChatScroll)
Vue.use(VueFire)
Vue.use(router)

Vue.config.productionTip = false

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')

store.dispatch('fetchUser')
