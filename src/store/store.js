import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import db from '@/firebase/init.js'

Vue.use(Vuex)

const state = {
  user: 'undetermined'
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
  fetchUser: async context => {
    var user = null 
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const ref = db.collection('users').doc(user.uid)
        var mirror = await ref.get()
        if (mirror.exists) {
          context.commit('setUser', mirror.data())
          checkOnlineStatusAndSetDisconnectHook (mirror.data())
        } else {
          const newUser = {
            displayName: user.displayName,
            uid: user.uid
          }
          context.commit('setUser', newUser)
          const countRef = db.collection('statistics').doc('users')
          const doc = await countRef.get()
          const numOfUsers = doc.data().count 
          newUser.feynmanNumber = numOfUsers + 1
          ref.set(newUser)
          countRef.update({
            count: numOfUsers + 1
          })
        }
      } else {
        // No user is signed in.
        console.log('user not logged in')
        context.commit('setUser', null)
      }
      // not necessary - the user only holds information such as tokens - and displayNames - the real important information
      // lies in Question.Feynman 

      // whenever "user" changes in Firestore, fetch the new values into Vuex again
      // const ref = db.collection('users').doc(user.uid)
      // ref.onSnapshot(doc => {
      //   console.log("Detected user doc change in Vuex, user is now =", doc.data())
      //   context.dispatch('fetchUser')
      // })
    }) 
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
})

export default store
