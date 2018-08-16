Database Logic 

When querying the content for a particular question, we use db.collection.where('questionID', '==', '6.006/1/2'), for example. 
However, this returns not a single document, but an array of documents. Therefore we have to retrieve it using [0]. 

I've considered using the questionID as the Firestore document ID itself when we create the questions. That way, to querying the content of the question, now we just use db.collection.doc(questionID), which returns a single document, which is more intuitive.

However, it turns out not to be possible because '/' or forward slashes are not allowed in document IDs. Therefore, retriving the question using 'question[0]' will have to do for now.

Feynmen.vue

There can be multiple chain reactions happening. We can filter people by groups, 

ChainReaction.vue 

This component takes a [{}, {}, {}...] i.e. a flat array of objects, each with their "parent" pointers (and no "children" pointers are needed)

The following requirements must be satisfied if the tree is to render:
    1) No node can have more than one parents 
    2) There can be no cycles i.e. it's a tree 
    3) There can only be one root node 

Classmates.vue

In the section, the user is able to message people from the 'Active Feynmen' section or the 'students' section. To ask a quick question/clarification, he'd message a student. To get a more complete and high quality explanation, he'd ask an Active Feynman. 

In an event of an "Eureka" moment, he presses the Eureka button. One of the following will happen:

1) He was taught by 1 or more Active Feynmen. He is added to the chain reaction, with his teacher parent being the Active Feynman he talked to last. 
2) he didn't get any help before. In that case, he initiates a freshly created chain reaction.

