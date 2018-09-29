import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/database'
import db from '@/firebase/init.js'

Vue.use(Vuex)

const state = {
  user: 'undetermined',
  handledOnlineStatus: false,
  hasFetchedUser: false
}

const mutations = {
  setUser: (state, payload) => {
    state.user = payload
    state.hasFetchedUser = true 
  },
  setHandledOnlineStatus: (state, payload) => {
    state.handledOnlineStatus = payload 
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
    if (snapshot.val() == false) {
      // since Firestore copies Firebase (due to our Cloud Functions), updating Firebase is enough to change both 
      firebaseRef.update(isOfflineForDatabase) 
      return
    }
    // tell Firestore that if they lose connection, just perform the operation we specify here (update the user to offline)
    // because we won't be able to tell them what to do when we lose connection, by definition
    firebaseRef.onDisconnect()
      .set(isOfflineForDatabase) 
      .then(() => {
        // now that we successfully prepared the "trap", update user as online until then
        firebaseRef.set(isOnlineForDatabase)
        ref.update(isOnlineForDatabase)
      })
  })
}

const actions = {  
  fetchUser: async context => { 
    console.log('fetchUser()')
    firebase.auth().onAuthStateChanged(async user => {
      console.log('auth state changed...')
      if (user) {
        const ref = db.collection('users').doc(user.uid)
        var mirror = await ref.get()
        var firstTime = true 
        if (mirror.exists) {
          ref.onSnapshot(mirror => {
            context.commit('setUser', mirror.data())
            if (!context.state.handledOnlineStatus) {
              checkOnlineStatusAndSetDisconnectHook(mirror.data())
              context.commit('setHandledOnlineStatus', true) 
            }
          })
        } else {
          const newUser = {
            displayName: user.displayName,
            uid: user.uid,
            conversations: [],
            firstTimePickingClasses: true,
            firstTimeViewingGroups: true,
            firstTimeInChat: true
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
          ref.onSnapshot(mirror => {
            context.commit('setUser', mirror.data())
            if (!context.state.handledOnlineStatus) {
              checkOnlineStatusAndSetDisconnectHook(mirror.data())
              context.commit('setHandledOnlineStatus', true) 
            }
          })
        }
      } else {
        context.commit('setUser', null) // user not logged in
      }
    }) 
  },
  logOut: async context => {
    await firebase.auth().signOut()
    context.commit('setUser', null)
    Promise.resolve()
  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
})

export default store
