import firebase from 'firebase/app'
import 'firebase/messaging'
import axios from 'axios'
import db from '@/firebase/init.js'
export {askForPermissionToReceiveNotifications, sendTokenToFirestore, getToken}

var currentTokenInDb = false
var token = undefined
//const messaging = firebase.messaging()
//messaging.usePublicVapidKey("BJ0Ou0MdMi6KAqeA8BOcmsFkzYCX0Uw5WmXZorqcgZX1Uf55bpJjbvb-Hq5eFajOXwI-j-w-D-o7X7J5FWJ34y4")

if ('Notification' in window && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then(async registration => {
      firebase.messaging().useServiceWorker(registration)
			askForPermissionToReceiveNotifications()
    })
	  .catch(error => console.log('error =', error))
}

const getToken = async () => {
	if(token) {
		return token;
	}
	else {
		try {
			token = await firebase.messaging().getToken()
			return token
		}
		catch(error) {
			token = undefined
			console.log(`error in getting the token = ${error}`)
			return undefined
		}
	}
}
const askForPermissionToReceiveNotifications = async () => {
  try {
    await firebase.messaging().requestPermission()
  } catch (error) {
    console.log(`error in getting permission = ${error}`)
  }
}

const sendTokenToFirestore = async uid => {
  if(!currentTokenInDb) {
		const ref = db.collection('users').doc(uid)
		const snapshot = await ref.get()
		const doc = snapshot.data()
		const token = await getToken()
		if(!doc.tokens) {
			doc.tokens = []
		}
		if(!token) {
			return
		}
		if(doc.tokens.includes(token)) {
			currentTokenInDb = true
		}
		else {
			doc.tokens.push(token)
			ref.set(doc)
			currentTokenInDb = true
		}
  }
}

const sendNotification = async (title, body) => {
  const requestBody = {
    notification: {
      title,
      body,
      click_action: "https://https://feynman-village.firebaseapp.com/"
    },
    to: await messaging.getToken()
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'key=AAAATwegD0Q:APA91bFqyN3LVqEtnEz829qCo-lynOl_5bvjc0knD4GBJm7p8I6K7ieo48DMJZgTYOJ5ceRVnZcxA5KAIoDYr3mkN9ad2752DfOG57hYt4h98PUU94TrZPclzMq239xdZ9gkZH9xBYHk'
  }
  console.log(headers)
  console.log(requestBody)
  axios.create({
    headers
  })
  .post('https://fcm.googleapis.com/fcm/send', requestBody)
  .then(response => console.log(response))
  .catch(error => console.log(error))
}

