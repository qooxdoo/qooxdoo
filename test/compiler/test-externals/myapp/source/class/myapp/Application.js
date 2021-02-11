/**
 * This is the main application class of "myapp"
 *
 * @asset(myapp/*)
 */
qx.Class.define("myapp.Application", {
  extend: qx.application.Standalone,

  members: {
    main: function() {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      new mylib.MyClass();
    }
  }
});
