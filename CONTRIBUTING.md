# Get Started
I'm happy to get you started through Google Hangouts - reach me on 
[Facebook](https://www.facebook.com/elton.lin.338)
or 
[email](eltonlin@mit.edu)

# Feature Roadmap 

Feynman is a place where students learn rapidly while becoming powerful and articulate thinkers.

The core feature of Feyman is the "chain reaction system". In the Open Beta Launch on September 1st, there must be: 

1. A system to match students in real life 

2. A system to match initiate and manage the chain reaction 

3. A graphical interface to keep track of the growing complexity of the chain reaction 

4. Support for interactive white boards/image and video uploads in the online chat page

5. A way to systematically store top explanations for the next generation of students 

To decide on what to work on, observe the discrepancies between the current website and the specification above. 

Here's a [detailed explanation](CHAINREACTION.md) on the actual implementation of the chain reaction: 

# Application Architecture 

The only folder you need to know about is the "src" folder. Do not be distracted by other folders. 

Here's what happens when the website runs (if the scripts were unminified and unuglified):
  1) 'index.html' is rendered on the page - it's script tag points to 'main.js'
  2) 'main.js' imports dependencies (e.g. Vue, Vue-router, Vuex) and creates an App instance based on 'App.vue'
  3) 'App.vue' contains a 'navbar' (which is always rendered) and a 'router-view' component.
  4) 'router-view' loads different components depending on the URL according to the code in [router.js](./src/router.js) 
   
  


