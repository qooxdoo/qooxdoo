var samples = {};

/**
 * Core
 */
samples["q"] = [];
samples["q"].push(function() {
  q("#myId"); // containing the element with the id 'myId'
});
samples["q"].push(function() {
  q(".myClass"); // finds all elements with the class 'myClass'
});
samples["q"].push(function() {
  q("li"); // finds all 'li' elements
});
samples["q"].push(function() {
  q(":header"); // finds all header elements (h1 to h6)
});
samples["q"].push(function() {
  q("#list :header"); // finds all header elements in the element with the id 'list'
});



samples["q.define"] = [];
samples["q.define"].push(function() {
  q.define("MyObject", {
    construct : function() {},
    members : {
      method : function() {}
    }
  });
});



/**
 * Events
 */
samples["q.ready"] = [];
samples["q.ready"].push(function() {
  q.ready(function() {
    // ready to go
  });
});

samples[".on"] = [];
samples[".on"].push(function() {
  // Suppose you like to have one extra parameter besides your event instance
  // e.g. you like to call the 'listenerFunction' within a for loop and pass the
  // current index.
  var listenerFunction = function(loopCounter, event) {
    // outputs the value of the 'i' variable
    console.log("current loopCounter is: ", loopCounter);

    // outputs the event instance
    console.log("event: ", event);
  };

  // Use 'Function.bind' method to pass the local 'i' variable 
  // to the 'listenerFunction' as first argument
  for (var i=0; i<10; i++) {
    q("div#myTarget" + i).on("click", listenerFunction.bind(this, i));
  }
});

/**
 * Messaging
 */
samples["q.messaging.on"] = [];
samples["q.messaging.on"].push(function() {
  q.messaging.on("get", "/address/{id}", function(data) {
    var id = data.params.id; // 1234
    // do something with the id...
  },this);
});
samples["q.messaging.onAny"] = [];
samples["q.messaging.onAny"].push(function() {
  q.messaging.onAny("/address/{id}", function(data) {
    var id = data.params.id; // 1234
    // do something with the id...
  },this);
});
samples["q.messaging.emit"] = [];
samples["q.messaging.emit"].push(function() {
  q.messaging.emit("get", "/address/1234"); // emit a message on the 'get' channel
});
samples["q.messaging.remove"] = [];
samples["q.messaging.remove"].push(function() {
  q.messaging.remove(id); // id must be the return of an 'on' call
});