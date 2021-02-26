/**
 * @asset(qx/icon/Tango/16/status/dialog-error.png)
 */
qx.Class.define("selectbox.ListDemoApplication", {
  extend: qx.application.Standalone,

  members: {
    main: function() {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      var doc = this.getRoot();
      var root = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      doc.add(root, { left: 10, top: 10, right: 10, bottom: 10 });


      let lst = new qx.ui.form.List().set({
        maxHeight: 100,
        readOnly: true
      });
      for (let i = 0; i < 100; i++) {
        let item = new qx.ui.form.ListItem("Hello World #" + (i+1));
        lst.add(item);
      }
      root.add(lst);
      
      let cbxReadOnly = new qx.ui.form.CheckBox("Read Only");
      lst.bind("readOnly", cbxReadOnly, "value");
      cbxReadOnly.bind("value", lst, "readOnly");
      root.add(cbxReadOnly);
      
      let cbxEnabled = new qx.ui.form.CheckBox("Enabled");
      lst.bind("enabled", cbxEnabled, "value");
      cbxEnabled.bind("value", lst, "enabled");
      root.add(cbxEnabled);
    }
  }
});
