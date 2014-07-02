addSample("q.matchMedia", {
  javascript: function() {
    var isLandscape = q.matchMedia("all and (orientation:landscape)").matches;  // true or false
  }
});

addSample("q.matchMedia", {
  javascript: function() {
    var mql = qxWeb.matchMedia("screen and (min-width: 480px)");
    mql.on("change",function(mql) {
      // Do your stuff
    });
  }
});

addSample("q.addSizeClasses", {
  javascript: function() {
    q.addSizeClasses();

    console.log(q("html").getClass());
  },
  executable: true
});
