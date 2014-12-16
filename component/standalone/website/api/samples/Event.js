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


addSample(".off", function() {
// adding a handler to your collection (happened earlier)
var myHandler = function(e) {
  var target = e.getTarget();
  // more code ...
};
q("#navigationBar").on("tap", myHandler);

// removing the listener - it's important to remove it with the same arguments
q("#navigationBar").off("tap", myHandler);

// this WON'T remove the listener, since you hand in a different context
// same for adding a listener with a context and forget to pass the third argument
q("#navigationBar").off("tap", myHandler, window); // WRONG: listener still there
});


addSample(".allOff", function() {
// before removing DOM elements, remove *all tap* listeners
q("#navigationBar").allOff("tap").remove();

// before removing DOM elements, remove *all* listeners
q("#navigationBar").allOff().remove();
}
);


addSample(".hasListener", {
  javascript: function() {
var myListener = function(e) {};

// sample code to demonstrate the pitfall with the context parameter
q(document.body).on('pointerdown', myListener, q(window));

// result will *always* be 'false'
// -> the context to check for is a *new* collection instance and *not* identical to the one used with the 'on' method
console.log(q(document.body).hasListener('pointerdown', myListener, q(window)));

// this will work
var context = q(window);
q(document.body).on('pointerdown', myListener, context);

// result will be 'true'
console.log(q(document.body).hasListener('pointerdown', myListener, context));
  },
  executable: true
});


addSample(".emit", {
  html: [ '<div id="target"></div>' ],
  javascript: function() {/* BE AWARE OF OVERUSING THIS PATTERN. IT CAN RESULT IN BAD / UNMAINTAINABLE CODE */

var target = q('#target');
// normally the listener and emitteer code won't be placed together
// just for demo cases packaged here together

// listener code
// there can be as many as callbacks registered as you like
// can be used for a 1:n communication
target.on('customEvent', function(data) {
  // 'data' is the payload of the event
  // in our case we can do the following:
  data.sampleMethod();
  var index = data.index;
});

// emitter code
// you can define whatever you like to as payload / data
target.emit('customEvent', {
  index: 3,
  sampleMethod: function() { alert('sampleMethod called!'); }
});
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

addSample(".hover", {
    html: ['<div id="container">',
     '  <div id="header">Header</div>',
     '  <div id="content">',
     '    <div id="visible">',
     '      <div id="box-content">Visible</div>',
     '    </div>',
     '   <div id="hover">',
     '     <div class="trigger">Hover area</div>',
     '   </div>',
     '  </div>',
     '</div>' ],
    css: [ '#header {',
      '  background-color: orange;',
      '  font-size: 5rem;',
    '}',
    '#container {',
      '  border: 1px solid green;',
      '  width: 300px;',
    '}',

    '#content {',
      '  overflow: hidden;',
      '  height: 400px;',
    '}',

    '#visible {',
      '  background-color: red;',
      '  position: relative;',
    '}',

    '#visible #box-content {',
      '  height: 400px;',
    '}',

    '.trigger {',
      '  position: relative;',
      '  background-color: purple;',
      '  height: 50px;',
    '}',

    '#hover {',
      '  background-color: yellow;',
      '  position: relative;',
      '  height: 400px;',
      '  top: -50px;',
    '}' ],
    javascript: function() {
var animationEndPosition = '-400px';

// animation description
var desc = {
  'keep': 100,
  'keyFrames': {
    0: { 'top': '-50px' },
    100: { 'top': animationEndPosition }
  },
  'delay': 0,
  'duration': 400
};

// setup / memorize collection to minimize DOM access
var mouseOver = false;
var hover = q('#hover');
var trigger = q('#hover .trigger');

// hover in
var hoverIn = function(e) {

  // if the user hovered over our 'trigger' element
  if (e.getTarget() == trigger[0]) {

    mouseOver = true;

    // start animation if no animation currently runs and there is a need for animation
    // -> the top position is not the target position
    if (hover.isPlaying() === false && hover.getStyle('top') === desc.keyFrames['0'].top) {
      desc.keyFrames['100'].top = animationEndPosition;
      hover.animate(desc);
      hover.setProperty('direction', 'forward');
    }
  }
};

// hover out
var hoverOut = function(e) {

  // extended check to be sure we're out of the 'content' element
  var mouseOver = q(e.getRelatedTarget()).isChildOf(this);

  if (mouseOver === false) {

    // since we might manipulated the description we set it for safety
    desc.keyFrames['100'].top = animationEndPosition;

    // if no animation runs and it's necessary to animate
    // -> safely reverse it
    if (hover.isPlaying() === false && hover.getStyle('top') === desc.keyFrames['100'].top) {

      hover.animateReverse(desc);
      hover.setProperty('direction', 'reverse');
    }
    // 'break' the forward animation if the user hovers out during this animation
    else if (hover.isPlaying() && hover.getProperty('direction') === 'forward') {

      // get the current pos and then stop the animation - order is important here
      var currentTopPosition = hover.getStyle('top');

      hover.stop();

      // begin with the current position - not the 'whole' animation
      desc.keyFrames['100'].top = currentTopPosition;
      hover.animateReverse(desc);
      hover.setProperty('direction', 'reverse');
    }

  }
};

// check for hover events at the 'content' element
q('#content').hover(hoverIn, hoverOut);
},
    executable: true
});

addSample(".onMatchTarget", function() {
q(document).onMatchTarget('pointerdown', '.demo-cell', function(target, event) {
  // whenever a 'pointerdown' on an event target occurs and the given selector matches
});
});

addSample(".onMatchTarget", {
  html: ['<ul id="test">',
    '  <li>List item</li>',
    '  <li class="special">List item</li>',
    '  <li>List item</li>',
    '  <li class="special">List item</li>',
    '  <li>List item</li>',
    '  <li>List item</li>',
    '</ul>'],
  css: ['.special {',
    '  background-color: #f00',
    '}'
  ],
  javascript: function() {
q('ul#test').onMatchTarget('pointerdown', '.special', function(target, event) {
  // whenever a 'pointerdown' on an event target occurs and the given selector matches
  console.log('pointer down on: ', target);
  console.log('pointer event instance: ', event);
});
},
  executable: true
});

addSample("keyboard-keyup", {
  html: [ '<input type="text" id="website"></input>',
    '<div id="textContainer"></div>'
  ],
  css: ['#website {',
    '  position: relative;',
    '  left: 50px;',
    '  top: 50px;',
    '  border: 1px solid #ADD8E6;',
    '  width: 50%;',
    '}',
    '',
    '#textContainer {',
    '  position: relative;',
    '  margin: 0 50px;',
    '  padding: 10px;',
    '  top: 75px;',
    '  background-color: #eee;',
    '  display: block;',
    '  height: 150px;',
    '  overflow: auto;',
    '  font-size: 12px;',
    '  font-family: Verdana;',
    '}'
  ],
  javascript: function() {
// Catch the key the user hit and display it in the div element
// IMPORTANT: use the 'keyup' or 'keydown' event when working with the 'getKeyIdentifier' method
// The 'keypress' event is due browser incompatibilities not recommended
// (e.g. some identifiers like 'Enter' or 'Backspace' are simply not working for Chrome)
q('#website').on('keyup', function(e) {
  var userInput = e.getKeyIdentifier();

  var content = q('#textContainer').getAttribute('text');
  // special case if the div element has no content
  content = content === null ? '' : content;

  q('#textContainer').setAttribute('text', content + ' ' + userInput);
});
},
executable: true
});

addSample("keyboard-keyup", {
  html: [ '<input type="text" id="website"></input>',
    '<div id="textContainer"></div>'
  ],
  css: ['#website {',
    '  position: relative;',
    '  left: 50px;',
    '  top: 50px;',
    '  border: 1px solid #ADD8E6;',
    '  width: 50%;',
    '}',
    '',
    '#textContainer {',
    '  position: relative;',
    '  margin: 0 50px;',
    '  padding: 10px;',
    '  top: 75px;',
    '  background-color: #eee;',
    '  display: block;',
    '  height: 150px;',
    '  overflow: auto;',
    '  font-size: 12px;',
    '  font-family: Verdana;',
    '}'
  ],
  javascript: function() {
// Use the 'keyup' event to sync the the value of an input element with a div element.
// Hint: do not use the 'keypress' event. The value of the input element is (yet) not updated at this time
// and you would get an old value.
q('#website').on('keyup', function(e) {
  // target is the input element
  var inputValue = q(e.getTarget()).getValue();

  // Sync with the div element by using the value of the input element in favor
  // of the value supplied by the event.
  // The value of 'e.getKeyIdentifier()' would return the key the user hit, but then
  // you have to handle Backspace, Delete and other special keys to sync the input and div element correctly.
  q('#textContainer').setAttribute('text', inputValue);
});
},
executable: true
});