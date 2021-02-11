qx.Class.define("tranapp.Application", {
  extend: qx.application.Standalone,

  members: {
    main: function() {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }
      
      new mylib.LibClass().doSomething();

      console.log(this.tr("App Alpha"));
      console.log(this.tr("App Beta"));
      console.log(this.tr("App Charlie"));
    }
  }
});