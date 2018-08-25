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
    1. Realtime and collaborative 
    2. Doodles can saved with a click and re-used in explanations
    3. All doodles are rendered stroke by stroke (quickly though) to preserve the thought process behind the drawings
    4. Support commonly used standard diagrams (e.g. binary trees for Intro to Algorithms) to reduce time spent drawing
  
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

A component does 3 things normally. 

1) It fetches data from Firestore and binds them to variables
  - look out for 'this.$bind...' in the 'mounted ()' hook
  ```
   mounted () {
     // save data to the 'question' variable 
     this.$bind('question', db.collection('questions').where('questionID', '==', this.$route.path))
      .then(doc => {
        this.loading = false
      })
      .catch(error => console.log(error))
   }
  ``` 
2) It renders the data using reusable UI components 
  - look out for 'v-for' used with pre-defiend Vue components: 
  ```
     <template v-for="question in questions">
       <base-card>{{ question.content }}</base-card>
     </template>
  ```
3) When users click buttons and check boxes, things happen. Those things are defined as methods: 
  - 
  ``` 
    // notice the enterChat(f) and ignore everything else 
    <a @click="enterChat(f)" class="secondary-content btn-floating pulse pink">
      <i class="material-icons white-text">email</i>
    </a>
  ```
  ```enterChat(f)``` is defined underneath in the '<script>' section: 
  ```
  methods: {
    async enterChat ({ uid, finished, displayName, chainReactionCreatorUID }) {
      // cannot chat with yourself 
      if (this.user.uid == uid) {
        return 
      }
    // more code 
  ```


