addSample("q.func.debounce", {
  javascript: function() {
// simple example to debounce the execution
var myCallback = function() {
  alert("debounced function");
};
var debouncedFunction = q.func.debounce(myCallback, 2000);
debouncedFunction();
  },
  executable: true
});

addSample("q.func.debounce", {
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
