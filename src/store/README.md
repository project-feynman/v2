One of Vuex's primary role is to manage user sessions. 

Sometimes, a user will enter a specific page (while logged in). Therefore, firebase.auth().currentUser will work as intended. However, we need to ensure that there's a one-way binding from 'firebase.auth().currentUser' to Vuex's 'state.user'.

For now, we'll use the simplest fix, and see if it's good enough. If the component fetches the user, and returns none, then it'll tell the store to set the user. 

Our Vuex store's primary roles are:
    1) It's the single source of truth for all components that need to know the value of firebase.auth().currentUser
        1) Whenever the website is loaded, it calls firebase.auth().currentUser to check if the user is logged in
        2) If the user is not logged in, it doesn't bother to do anything.
        3) If the user is logged in, it checks if a mirror user in Firestore exists, and creates one if it doesn't.
        4) Finally, it just assigns a global variable "user" that other components have access to. 
        5) Here, we have a single source of truth, and whenever "user" changes value, other components reactively update.


The first time the app loads, main.js is executed. There, we call Vuex to fetch a reference to "firebase.auth().currentUser". However, unlikely previously, we let the components render first and run all the async tasks associated with managing user sessions IN PARALLEL. 

Improvements: 

1) Notice, what blocks the app from rendering was that first, Vuex had to finish all its tasks (we used await) before we let the App load. Now we run the Vuex tasks after the app loads.

2) Secondly, we make "commits" as early as we can, as they are synchronous, and once completed, the other components that need the "user" are able to do what they need to do. You'll notice in many of the actions here, we make commits as early as we can, and then run the other necessary asynchronous tasks afterwards in parallel. 