import db from '@/firebase/init.js'

var permission = false
var position = undefined


const getPermissionForGeolocation = (success = ((_) => { }), error = ((_) => { })) => {
	if('geolocation' in navigator) {
		permission = true
		navigator.geolocation.getCurrentPosition((pos) => { 
			position = pos
			success(pos)
		}, error)
	}
}

var getPosition = () => {
	if (permission) {
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
const sendPositionToFirestore = async (uid, pos = position) => {
	if (permission) {
		const ref = db.collection('users').doc(uid)
		const snapshot = await ref.get()
		const doc = snapshot.data()
		doc.position = pos
		ref.set(doc)
	}
}

export { getPermissionForGeolocation, sendPositionToFirestore }
