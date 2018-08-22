In paper.js, calling "add()" automatically triggers an update/redraw

There is a problem with the fact that, when you directly visit a chat URL, the user state has not been initialized (as supposed to if you went through the normal workflow of the website).

Therefore, we have to check for two possibilities:
  1) User is already set by Vuex (normal case)
  2) User is getting set by Vuex (user is directly visiting the chat and rendering the app right now):
    wait till the user has been set.

We will discuss about implementations of 2) 
  - currently, we use a watcher 
  - I think for the sake of defensive programming, we have to ensure that the watcher code can only get
  triggered once. Otherwise, that same piece of code could be triggered multiple times if the user document changes (i.e. offline/online state updates) - but we only care about the initial transition from undetermined 
  - we also just have to handle the case if the user is not logged in and that they try to enter the website - these cases would have to be handled

