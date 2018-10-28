import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/database'
import db from '@/firebase/init.js'
import * as user from '@/store/modules/user.js'

Vue.use(Vuex)

const store = new Vuex.Store({
	modules: {
		user
	}
})

export default store
