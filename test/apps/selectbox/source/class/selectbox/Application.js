/* ************************************************************************

   Copyright:


   License:

   Authors:

 ************************************************************************ */

/**
 * This is the main application class of your custom application "dragndrop"
 * 
 * @asset(qx/icon/Tango/16/status/dialog-error.png)
 */
qx.Class.define("selectbox.Application", {
  extend: qx.application.Standalone,

  members: {
    main: function() {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      var doc = this.getRoot();
      var root = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 5));
      doc.add(root, { left: 10, top: 10, right: 10, bottom: 10 });

      var model = qx.data.marshal.Json.createModel([
        { name: "alpha" },
        { name: "bravo" },
        { name: "charlie" },
        { name: "delta" }
      ]);
      /*
      var cbo = new qx.ui.form.SelectBox();
      var ctlr = new qx.data.controller.List(model, cbo, "name");
      ctlr.getSelection().replace([]);
      root.add(new qx.ui.basic.Label("Allows null, but user cannot select null :"), { row: 0, column: 0 });
      root.add(cbo, { row: 0, column: 1 });
      */
      
      function createTest(row, allowNull, userCanSelect, preloadModel) {
        var cbo = new qx.ui.form.SelectBox();
        var ctlr = new qx.data.controller.List(preloadModel ? model : null, cbo, "name");
        if (allowNull && userCanSelect) {
          ctlr.set({
            allowNull: true,
            nullValueTitle: "(No value selected)",
            nullValueIcon: "qx/icon/Tango/16/status/dialog-error.png"
          });
        }
        if (!preloadModel)
          ctlr.setModel(model);
        ctlr.getSelection().replace([]);
        
        var str = "Does not allow null";
        if (allowNull) {
          str = "Allows null";
          if (userCanSelect)
            str += ", user can select null";
          else
            str += ", user cannot select null";
        }
        if (preloadModel)
          str += ", preload";
        root.add(new qx.ui.basic.Label(str + " :"), { row: row, column: 0 });
        root.add(cbo, { row: row, column: 1 });
        var txt = new qx.ui.form.TextField().set({ readOnly: true });
        ctlr.getSelection().addListener("change", () => {
          var arr = ctlr.getSelection();
          var item = arr.getLength() ? arr.getItem(0) : null;
          txt.setValue(item ? item.getName() : "(null)");
        });
        root.add(txt, { row: row, column: 2 });
        var btn = new qx.ui.form.Button("Set to null");
        btn.addListener("execute", () => ctlr.getSelection().replace([]));
        root.add(btn, { row: row, column: 3 });
      }
      
      var row = 0;
      createTest(row++, false, false, true);
      createTest(row++, true, false, true);
      createTest(row++, true, true, true);
      createTest(row++, true, true, false);
    }
  }
});
