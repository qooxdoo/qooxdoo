/**
 * Minimal test application for afterProcessFinished callback test
 * @require(qx.core.BaseInit)
 */
qx.Class.define("testAfterProcessFinished.Application", {
  extend: qx.application.Basic,
  members: {
    main: function() {
      this.base(arguments);
      console.log("testAfterProcessFinished Application loaded");
    }
  }
});
