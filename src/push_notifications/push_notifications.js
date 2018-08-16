import firebase from 'firebase'
import axios from 'axios'

const messaging = firebase.messaging()
messaging.usePublicVapidKey("BJ0Ou0MdMi6KAqeA8BOcmsFkzYCX0Uw5WmXZorqcgZX1Uf55bpJjbvb-Hq5eFajOXwI-j-w-D-o7X7J5FWJ34y4")

const askForPermissionToReceiveNotifications = async () => {
  try {
    await messaging.requestPermission()
  } catch (error) {
    console.error(error)
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
export {askForPermissionToReceiveNotifications, sendNotification, messaging}