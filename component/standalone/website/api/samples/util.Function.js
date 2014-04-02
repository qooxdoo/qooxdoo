addSample('q.func.debounce', {
  javascript: function() {
// simple example to debounce the execution
var myCallback = function() {
  console.log('debounced function');
};
var debouncedFunction = q.func.debounce(myCallback, 2000);
debouncedFunction();
  },
  executable: true
});

addSample('q.func.debounce', {
  javascript: function() {
// advanced example with event handling - the handler is called only if no 'resize' events
// where triggered for at least 500 milliseconds
var resizeHandler = function() {
  console.log('current viewport is: ' + q(window).getWidth() + ' x ' + q(window).getHeight());
};

var winCollection = q(window);
winCollection.on('resize', q.func.debounce(resizeHandler, 500), winCollection);
  },
  executable: true
});

addSample('q.func.throttle', {
javascript: function() {
// simple example to throttle the execution
var myCallback = function() {
  // this callback is called *four times* due the leading and trailing calls
  console.log('throttled function');
};

var throttledFunction = q.func.throttle(myCallback, 500);
var counter = 0;
var intervalId = window.setInterval(function() {
  throttledFunction();

  if (counter == 12) {
    window.clearInterval(intervalId);
  }
  counter++;
}, 100);

  },
  executable: true
});

addSample('q.func.throttle', {
javascript: function() {
var myCallback = function() {
  // this callback is called *twice* -  the leading and trailing calls are omitted by configuration
  console.log('throttled function');
};

var options = {
  leading: false,
  trailing: false
};
var throttledFunction = q.func.throttle(myCallback, 500, options);
var counter = 0;
var intervalId = window.setInterval(function() {
  throttledFunction();

  if (counter == 12) {
    window.clearInterval(intervalId);
  }
  counter++;
}, 100);

  },
  executable: true
});


addSample('q.func.throttle', {
  javascript: function() {
// advanced example with event handling - the handler is only called
// every 500ms during the resizing of the browser window
var resizeHandler = function() {
  console.log('current viewport is: ' + q(window).getWidth() + ' x ' + q(window).getHeight());
};

var winCollection = q(window);
winCollection.on('resize', q.func.throttle(resizeHandler, 500), winCollection);
  },
  executable: true
});