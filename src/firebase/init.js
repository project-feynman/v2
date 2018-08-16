import firebase from 'firebase'

var config = {
  apiKey: 'AIzaSyB_06WA9vr4mqlukdjN591xyHPJ_SOgyds',
  authDomain: 'feynman-village.firebaseapp.com',
  databaseURL: 'https://feynman-village.firebaseio.com',
  projectId: 'feynman-village',
  storageBucket: 'feynman-village.appspot.com',
  messagingSenderId: '339430346564'
}

const firebaseApp = firebase.initializeApp(config)
firebaseApp.firestore().settings({ timestampsInSnapshots: true })

export default firebaseApp.firestore()
