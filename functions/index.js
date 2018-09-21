const config = require('./config')
const webpush = require('web-push')

const functions = require('firebase-functions')

const admin = require('firebase-admin')
admin.initializeApp()

const firestore = admin.firestore()
firestore.settings({timestampsInSnapshots: true})

const vapidKeys = config.vapidKeys
webpush.setVapidDetails(
	'mailto:hubewasi@gmail.com',
	vapidKeys.publicKey,
	vapidKeys.privateKey
)

exports.onStatusChange = functions.database.ref('/status/{uid}').onUpdate( async (change, context) => {
	const eventStatus = change.after.val()
	console.log(context.params.uid)
	const userFirestoreDoc = await firestore.doc('/users/' + context.params.uid).get()
	return change.after.ref.once('value').then(async latestSnapshot => {
		if (latestSnapshot.val().last_changed > eventStatus.last_changed) 
			return null;
		eventStatus.last_changed = new Date(eventStatus.last_changed);
		var data = userFirestoreDoc.data()
		data.isOnline = eventStatus.isOnline
		userFirestoreDoc.ref.set(data)
		console.log('finished')
	})
})
exports.notificationOnNewMessage = functions.https.onRequest((req, res) => {
	const data = req.body
	const message = data.message
	const uid = data.uid
	const senderName = message.author.displayName

})
exports.notificationOnNewMessage = functions.firestore.document('/chatrooms/{roomID}').onUpdate((change, context) => {
	if(change.after.data().messages == change.before.data().messages)
	{
		return;
	}

	const roomID = context.params.roomID;

	const messages = change.after.data().messages
	const participants = change.after.data().participants
	const message = messages[messages.length - 1]
	const senderName = message.author.displayName
	const senderUid = message.author.uid
	console.log(message)
	receivers = participants.filter((participant) => participant.uid !== senderUid)
	console.log('receivers = ' + receivers)
	receiverUids = receivers.map((receiver) => receiver.uid)
	console.log('receiver uids = ' + receiverUids)
	receiverUids.forEach(function(receiverUid) {
		firestore.doc('/users/' + receiverUid).get().then(async snapshot => {
			var receiverSubscriptions = snapshot.data().subscriptions
			console.log(receiverSubscriptions)
			if(!receiverSubscriptions) {
				return;
			}
			receiverSubscriptions.forEach(function(sub) {
				console.log(sub + 'should work')
				const subscription = JSON.parse(sub)
				const payload = {
					senderName,
					body: message.content,
					type: "message"
				}
				console.log(payload)
				webpush.sendNotification(subscription, JSON.stringify(payload)).catch((err) => console.log(error))
			})
		})
	})

	return null;
})
