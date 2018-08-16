
const functions = require('firebase-functions')

const admin = require('firebase-admin')
admin.initializeApp()

const firestore = admin.firestore()
firestore.settings({timestampsInSnapshots: true})
exports.addStudent = functions.https.onCall(async (req, res) => {

	const studentUid = req.query.uid
	const questionID = req.query.questionID
	const questions = firestore.collection('questions')
	const userDoc = await firestore.doc('/users/' + studentUid).get()
	const displayName = userDoc.data().displayName

	return questions.where('questionID', '==', questionID).onSnapshot(snapshot => {
		var data = snapshot.docs[0].data()
		if (!data.users) {
			data.users = []
		}
		if (!data.users.find(u => u.uid == studentUid)) {
			data.users.push({
				displayName: displayName, 
				finished: false, 
				retired: false, 
				uid: studentUid,
				teacher: null
			      })
			snapshot.docs[0].ref.set(data)
		}
		console.log('finished')
	})
})

exports.addTeacher = functions.https.onCall(async (req, res) => {
	const teacherUid = req.query.uid
	const questionID = req.query.questionID
	const questions = firestore.collection('questions')
	const userDoc = await firestore.doc('/users/' + teacherUid).get()
	const displayName = userDoc.data().displayName;

	return questions.where('questionID', '==', questionID).onSnapshot(snapshot => {
		var data = snapshot.docs[0].data()
		var matchingUser = data.users.find(u => u.uid == teacherUid)
		if (matchingUser.finished == false) {
			data.users.splice(data.users.indexOf(matchingUser[0]), 1)
			data.users.push({
				displayName: displayName, 
				finished: true, 
				retired: false, 
				uid: teacherUid,
				student: null
			      })
			snapshot.docs[0].ref.set(data)
		}	
		else if (!matchingUser) {
			data.users.push({
				displayName: displayName, 
				finished: true, 
				retired: false, 
				uid: teacherUid,
				student: null
			      })
			snapshot.docs[0].ref.set(data)
		}
		console.log('finished')
	})
})

exports.onStatusChange = functions.database.ref('/status/{uid}').onUpdate( async (change, context) => {
	const eventStatus = change.after.val()
	console.log(context.params.uid)
	const userFirestoreDoc = await firestore.doc('/users/' + context.params.uid).get()
	return change.after.ref.once('value').then(async latestSnapshot => {
		if (latestSnapshot.val().last_changed > eventStatus.last_changed) 
			return null;
		console.log('about to break!')
		eventStatus.last_changed = new Date(eventStatus.last_changed);
		console.log('this should not print')
		var data = userFirestoreDoc.data()
		data.isOnline = eventStatus.isOnline // shouldn't 
		userFirestoreDoc.ref.set(data)
		console.log('finished')
	})
})

exports.notificationOnNewMessage = functions.firestore.document('/chatRooms/{roomID}').onUpdate(async (change, context) => {
	const roomID = context.params.roomID;

	const messages = change.after.val().messages
	const latestMessage = messages[messages.length - 1]

})
