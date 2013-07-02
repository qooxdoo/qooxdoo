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