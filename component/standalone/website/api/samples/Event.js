addSample("q.ready", function() {
  q.ready(function() {
    // ready to go
  });
});

addSample("q.ready", function() {

  var myClass = q.define("myNamespace.myClass", {
    statics: {
      myMethod : function() {
        this.anotherMethod();
      },

      anotherMethod : function() {
        // do something
      }
    }
  });

  // Use 'ready' together with a named function and
  // call your method with scope correction
  q.ready(myClass.myMethod.bind(myClass));
});


addSample(".on", function() {
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

addSample(".on", function() {
  // handle keyup event with scope correction
  var handleFilterInput = function(ev) {
    // event object
    console.log(ev);

    // get input value
    var value = q(ev.getTarget()).getValue();

    // if target is a checkbox you could do something like this when handling the change event
    q(ev.getTarget()).getAttribute('checked');
  };

  q('#someElement').on('keyup', handleFilterInput, this);
});

addSample(".on", {
  javascript: function() {
// advanced example with event handling - the handler is called only if no "resize" events
// where triggered for at least 500 milliseconds
var resizeHandler = function() {
  alert("current viewport is: " + q(window).getWidth() + " x " + q(window).getHeight());
};

var winCollection = q(window);
winCollection.on("resize", q.func.debounce(resizeHandler, 500), winCollection);
  },
  executable: true
});

addSample(".hover", {
    html: ['<div id="hover">Hover element</div>'],
    javascript: function() {
q("#hover").hover(function() {
  this.setStyles({ color: "#ff0000",
                   backgroundColor: "#00ff00" });
}, function() {
  this.setStyles({ color: "#00ff00",
                  backgroundColor: "#ff0000" });
  });
},
    executable: true
});