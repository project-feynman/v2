self.addEventListener('push', function(event) {
	const data = event.data.json()
	if(data.type && data.type === 'message') {
		registration.showNotification(data.senderName + " sent you a message...", {
			body: data.body
		})
	}
	console.log(event.data.json())
})
