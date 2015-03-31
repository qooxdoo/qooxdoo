addSample("Event.getTarget", {
  javascript: function () {
    var collection = q("div.inline");
    collection.on("click", function (e) {
      var clickedElement = e.getTarget();
    });
  }
});

addSample("Event.getRelatedTarget", {
  javascript: function () {
    var collection = q("div.inline");
    collection.on("mouseout", function (e) {
      // when using 'mouseout' events the 'relatedTarget' is pointing to the DOM element
      //  the device exited to.
      // Useful for scenarios you only interested if e.g. the user moved away from a
      // section at the website
      var exitTarget = e.getRelatedTarget();
    });

    collection.on("mouseover", function (e) {
      // when using 'mouseover' events the 'relatedTarget' is pointing to the DOM element
      // the device entered from.
      var earlierElement = e.getRelatedTarget();
    });
  }
});

addSample("Event.getCurrentTarget", {
  javascript: function () {
    var collection = q("div.inline");
    collection.on("mouseout", function (e) {
      var current = e.getCurrentTarget();
    });
  }
});
