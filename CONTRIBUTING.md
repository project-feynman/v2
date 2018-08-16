# Get Started

The most pain-free way to get started is to message me on Facebook or email me. I'll then guide you through the process with a video phone call via Google Hangouts (which also allows screenshare). 

Facebook: https://www.facebook.com/elton.lin.338

Email: eltonlin@mit.edu

# MVP

Feynman is a place where students learn rapidly while becoming powerful and articulate thinkers.

The core feature of Feyman is the "chain reaction system". In the Open Beta Launch on September 1st, there must be: 

1. A system to match students in real life 

2. A system to match initiate and manage the chain reaction 

3. A graphical interface to keep track of the growing complexity of the chain reaction 

4. Support for interactive white boards/image and video uploads in the online chat page

5. A way to systematically store top explanations for the next generation of students 

To decide on what to work on, observe the discrepancies between the current website and the specification above. 

Here's a [detailed explanation](CHAINREACTION.md) on the actual implementation of the chain reaction: 

# Tasks 

Reading? Nobody ain't got time for that! Let's just get right to the action. 

Top priority, brekathrough features that the core team is struggling with: 

  1) Track geolocation of users to notify them when someone else in a nearby location happens to be on the same part of the p-set and would like to study together (core feature #1) 
  2) Create a live white board so students can draw visual explanations during a 1-on-1 (core feature #4)
 
"Supposedly Easy" tasks for building momentum (things are rarely as simple as they seem):

  1) Use a Materialize "spinner" to replace "Loading..." 
  2) Create ACTUAL admin privileges for deleting and creating questions and p-sets (currently, I use v-if="user.displayName == 'Elton Lin'") 

If you want to have more impact, view GitLab: https://gitlab.com/Gustwalker/Feynman/boards?=

# Application Architecture

Diagram to be uploaded...

