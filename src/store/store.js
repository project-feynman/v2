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
          checkOnlineStatusAndSetDisconnectHook(mirror.data())
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
          countRef.update({
            count: numOfUsers + 1
          })
          await ref.set(newUser) // we want to minimize the # of updates we make before setting up an onSnapshot callback 
          mirror = await ref.get()
        }
        checkOnlineStatusAndSetDisconnectHook(mirror.data())
      } else {
        // No user is signed in.
        console.log('user not logged in')
        context.commit('setUser', null)
      }
      // one-way bind Firestore's user to Vuex's user 
      db.collection('users').doc(user.uid).onSnapshot(snapshot => 
        {
          console.log('user was changed (detected in Vuex)')
          console.log(`data = ${JSON.stringify(snapshot.data())}`)
        }) 
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
