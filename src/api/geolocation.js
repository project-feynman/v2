import db from '@/firebase/init.js'

var permission = false
var position = undefined

const getPermissionForGeolocation = () => {
	if('geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition((position) => { this.position = position })
		permission = true
	}
}

var getGeolocation = () => {
	if(permission) {
		return position
	} else {
		return undefined
	}
}

const sendPositionToFirestore = async uid => {
	if(!positionSent && permission) {
		const ref = db.collection('users').doc('uid')
		const doc = await ref.get().data()
		doc.position = position
		ref.set(doc)
	}
}
