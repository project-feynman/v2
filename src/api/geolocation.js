import db from '@/firebase/init.js'

var permission = false
var position = undefined


const getPermissionForGeolocation = () => {
	if('geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition((_position) => { 
			position = _position 
			permission = true
		})
	}
}

var getPosition = () => {
	if(permission) {
		return position
	} else {
		return undefined
	}
}
const updatePosition = () => {
	if(permission) {
		navigator.geolocation.getCurrentPosition((_position) => { position = _position })
	}
}
const sendPositionToFirestore = async uid => {
	if(permission) {
		const ref = db.collection('users').doc('uid')
		const snapshot = await ref.get()
		const doc = snapshot.data()
		doc.position = position
		ref.set(doc)
	}
}

getPermissionForGeolocation()
sendPositionToFirestore()
