import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import db from '@/firebase/init.js'

Vue.use(Vuex)

const state = {
  user: null
}

const getters = {
  getUser: state => state.user
}

const mutations = {
  setUser: (state, payload) => {
    state.user = payload
  }
}

function checkOnlineStatusAndSetDisconnectHook (user) {
  const ref = db.collection('users').doc(user.uid)
  const firebaseRef = firebase.database().ref('/status/' + user.uid)
  var isOfflineForDatabase = {
    isOnline: false,
    last_changed: firebase.firestore.FieldValue.serverTimestamp()
  }
  var isOnlineForDatabase = {
    isOnline: true,
    last_changed: firebase.firestore.FieldValue.serverTimestamp()
  }
  firebase.database().ref('.info/connected').on('value', snapshot => {
    // if user is offline, there'd be no need to set up an 'onDisconnect()'
    if (snapshot.val() == false) {
      firebaseRef.update(isOfflineForDatabase) // firebase wants to keep track of whether Firestore is also synced
      return
    }
    // user is online, set up a onDisconnect that will be triggered when he leaves
    firebaseRef.onDisconnect()
      .set(isOfflineForDatabase) // this is triggered successfully, this is the magic bit not yet supported for Firestore
      .then(() => {
        // now we set the trap, set the user to online for now until then
        firebaseRef.set(isOnlineForDatabase)
        ref.update(isOnlineForDatabase)
      })
  })
}

const actions = {
  setUser: async context => {
    const user = firebase.auth().currentUser
    // user is just not logged in
    if (!user) {
      return
    }
    const ref = db.collection('users').doc(user.uid)
    var mirror = await ref.get()
    if (!mirror.exists) {
      // first time user
      await ref.set({
        displayName: user.displayName,
        uid: user.uid
      })
      mirror = await ref.get()
      checkOnlineStatusAndSetDisconnectHook(user)
      context.commit('setUser', mirror.data())
    } else {
      // returning user
      checkOnlineStatusAndSetDisconnectHook(user)
      context.commit('setUser', mirror.data())
    }
  },
  logOut: async context => {
    await firebase.auth().signOut()
    context.commit('setUser', null)
  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})

export default store
