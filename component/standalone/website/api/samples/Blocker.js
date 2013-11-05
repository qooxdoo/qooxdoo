addSample(".block", {
  html: ['<div id="myId">',
         '  Test',
         '</div>'],
  javascript: function() {
    q("#myId").block("red", 0.4);
  },
  executable: true
});

addSample(".unblock", {
  html: ['<div id="myId">',
         '  Test',
         '</div>'],
  javascript: function() {
    q("#myId").block("red", 0.4);
    window.setTimeout(function() {
      q("#myId").unblock();
    }, 2000);
  },
  executable: true
});

addSample(".getBlocker", {
  html: ['<div id="myId">',
         '  Test',
         '</div>'],
  javascript: function() {
    q("#myId").block("red", 0.4);
    var blockerElement = q("#myId").getBlocker();
    blockerElement.on("click", function(e) {
      // react on user clicks at the blocker element itself
    });
  },
  executable: true
});