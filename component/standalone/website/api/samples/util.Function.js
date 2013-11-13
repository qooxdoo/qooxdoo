addSample("q.function.defer", {
  javascript: function() {
// simple example to defer the execution
var myCallback = function() {
  alert("deferred function");
};
var deferredFunction = q.function.defer(myCallback, 2000);
deferredFunction();
  },
  executable: true
});

addSample("q.function.defer", {
  javascript: function() {
// advanced example with event handling - the handler is called only if no "resize" events
// where triggered for at least 500 milliseconds
var resizeHandler = function() {
  alert("current viewport is: " + q(window).getWidth() + " x " + q(window).getHeight());
};

var winCollection = q(window);
winCollection.on("resize", q.function.defer(resizeHandler, 500), winCollection);
  },
  executable: true
});