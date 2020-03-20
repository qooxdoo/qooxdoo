/**
 * This is the main application class of "issue9553"
 * 
 * @asset(issue9553/*)
 */
qx.Class.define("issue9553.Application", {
  extend: qx.application.Standalone,

  members: {
    main: function() {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      var doc = this.getRoot();

      var container = new qx.ui.container.Composite(new qx.ui.layout.Flow());
      var renderLayout = container.renderLayout;
      container.renderLayout = function(left, top, width, height) {
        console.log("container.renderLayout: " + JSON.stringify({left, top, width, height}));
        return renderLayout.call(this, left, top, width, height);
      };
      var getBounds = container.getBounds;
      container.getBounds = function() {
        let b = getBounds.call(this);
        console.log("container.getBounds = " + JSON.stringify(b));
        return b;
      };
      var label1 = new qx.ui.basic.Label("Label 1");
      var label2 = new qx.ui.basic.Label("Label 2");

      // container.add(label1);

      qx.event.Timer.once(function() {
        container.add(label2);
      }, null, 1000);

      this.getRoot().add(container);//, { top: 0, right: 0, bottom: 0, left: 0 });
    }
  }
});

