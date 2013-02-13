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

samples["q.$attach"] = [];
samples["q.$attach"].push(function() {
  q.$attach({"test" : 123}); // q("#id").test == 123
});


samples["q.$attachStatic"] = [];
samples["q.$attachStatic"].push(function() {
  q.$attachStatic({"test" : 123}); // q.test == 123
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
  // A common use case is to pass in some extra parameters to an event listener. 
  // This example uses the 'Function.bind' method to achieve that. It also 
  // demonstrates how the scope of the listener function can be changed.

  // Suppose you like to have two extra parameters besides your event instance
  var listenerFunction = function(firstArg, secondArg, event) {
    // outputs "foo"
    console.log("first argument: ", firstArg);

    // outputs "bar"
    console.log("second argument: ", secondArg);

    // outputs the event instance
    console.log("event: ", event);

    // 'this' points to 'myInstance'
    var baz = this.anyVariable;
  };

  // Suppose you have an instance named 'myInstance', which holds some variables 
  // you like to access within your 'listenerFunction'
  q("div#myTarget").on("click", listenerFunction.bind(myInstance, "foo", "bar"));
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