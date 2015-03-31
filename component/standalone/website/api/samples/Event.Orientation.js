addSample("Event.getOrientation", {
  javascript: function () {
    q(window).on("orientationchange", function (e) {
      var orientation = e.getOrientation();
    });
  }
});

addSample("Event.isLandscape", {
  javascript: function () {
    q(window).on("orientationchange", function (e) {
      e.isLandscape();
    });
  }
});

addSample("Event.isPortrait", {
  javascript: function () {
    q(window).on("orientationchange", function (e) {
      e.isPortrait();
    });
  }
});
