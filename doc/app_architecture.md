# Diagram 

To be added...

# Index.html

The App is a Single Page Application (SPA), which means we have just 1 index.html file (src/index.html).
But obviously it'll be shit if it's just pure HTML. All the fun happens in the JS world. 
From inspecting the source code, you'll notice that there are a variety of script tags. Some are readable and famous
e.g. Materialize CSS, Google Font Icons. Others are undecipherable, uglified and minified JS files. What are they?

# src/main.js

The undecipherable JS is the compiled Vue code that we've written. It's not supposed to be understandeable. To understand our app, you'd have to look at our actual project source code. 

The way Vue works is that, they provide abstractions for you to "illegally" put HTML, JS and CSS together, in a way that makes a lot of sense for humans.
However, browsers only parse proper HTML, CSS and JS files. Therefore, everything you write in Vue has to ultimately be compiled into separate, pure HTML, CSS and JS.

Vue.js consists of a single entry point, "main.js". "main.js" loads a single component, "App.vue".

Now we get to the good part: "App.vue" consists of a "Header.vue" component and a "RouterView" component. 

The "Header.vue" component is just a pre-defined collection of HTML code - meaning there's always a header in our app.
The "RouterView" is more interesting. It's what "simulates" routing in our Single Page Application.

# src/router/index.js 

When we visit a particular URL, we'd like the App to render different components. In a Single Page Application, 
the RouterLink component becomes replaced by the component that should be rendered for a given URL. For example, in localhost:8080/6.006,
the "Subject.vue" component should be loaded. That's the job of "RouterView" - it doesn't actually exist. Rather, it's a loader of different components.

How do we determine which component RouterLink should load for any particular URL? We specify them in "src/router/index.js"

If we want localhost:8080/dashboard to load the Dashboard component, then we'd pass {path: /dashboard, component: Dashboard}
To see the full syntax, just visit the file. 














