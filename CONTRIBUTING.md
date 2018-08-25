# Get Started
I'm happy to get you started through Google Hangouts - reach me on 
[Facebook](https://www.facebook.com/elton.lin.338)
or 
[email](eltonlin@mit.edu)

# Specifications 

Fullstack:
  - Offline push notifications (Progressive Web Application) 
  - Responsive UI 
  - Speed optimizations 
  
Specialist: 

The core features are the interactive whiteboard and the chain reaction system. They are rabbit holes all by themselves

  - Whiteboard: 
    1. A way to systematically store top explanations for the next generation of students 
    2. Support for interactive white boards/image and video uploads in the online chat page
    3. Support common reusable diagrams for differen topics 
  
  - [Chain reaction](CHAINREACTION.md)
    1. A system to match students in real life 
    2. A system to match initiate and manage the chain reaction 
    3. A graphical interface to keep track of the growing complexity of the chain reaction 
    
Current active sprints are tracked in [Gitlab](https://gitlab.com/Gustwalker/Feynman/boards?=)

# Application Architecture 

The only folder you need to know about is the "src" folder. Do not be distracted by other folders. 

Here's what happens when the website runs (if the scripts were unminified and unuglified):
  1) [index.html](./public/index.html) runs on Chrome - it imports [main.js](./src/main.js) in its script tag.
  2) [main.js](./src/main.js) imports global dependencies and renders [App.vue](./App.vue).
  3) [App.vue](./App.vue) contains a [navbar](./src/components/TheNavbar.vue) and a [router-view](https://github.com/vuejs/vue-router) component
  4) [router-view](https://github.com/vuejs/vue-router) magically loads different components depending on the URL according to the code in [router.js](./src/router.js) 
 
# Vue Components

Components are defined in '.vue' files. There are three types of components:

1) [View components](./src/views) are the 'pages'/root components rendered at each URL.
2) [Base components](./src/components/reusables) are typically 'buttons' and 'cards' used throughout the app
3) [Normal components](./src/components) where the fun is...


