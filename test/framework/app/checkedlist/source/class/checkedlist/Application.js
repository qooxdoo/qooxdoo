/* ************************************************************************

   Copyright: 2021 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

/**
 * This is the main application class of "checkedlist"
 *
 * @asset(checkedlist/*)
 */
qx.Class.define("checkedlist.Application", {
  extend : qx.application.Standalone,

  members : {
    main : function() {
      this.base(arguments);

      qx.log.appender.Native;
      qx.log.appender.Console;

      var doc = this.getRoot();
      
      let model = [];
      let checked = [];
      for (let i = 0; i < 20; i++) {
        model.push({ name: "Item " + (i+1) });
        if ((i%2) == 0)
          checked.push(i);
      }
      model = qx.data.marshal.Json.createModel(model);
      checked = checked.map(i => model.getItem(i));
      checked = new qx.data.Array(checked);
        
      (function() {
        let lst = new qx.ui.form.CheckedList();
        doc.add(lst, {left: 100, top: 50});
       
        let ctlr = new qx.data.controller.CheckedList(model, lst, "name").set({
          checked: checked
        });
        ctlr.getChecked().addListener("change", evt => {
          let data = evt.getData();
          let str = ctlr.getChecked().map(v => v.getName()).join(",");
          console.log("Change Checked: " + data.type + ": " + str);
        });
      })();

      (function() {
        let lst = new qx.ui.form.CheckedSelectBox().set({ maxWidth: 200 });
        doc.add(lst, {left: 300, top: 50});
       
        let ctlr = new qx.data.controller.CheckedList(model, lst, "name").set({
          checked: checked,
          checkedLabelPath: "name"
        });
        ctlr.getChecked().addListener("change", evt => {
          let data = evt.getData();
          let str = ctlr.getChecked().map(v => v.getName()).join(",");
          console.log("Change Checked: " + data.type + ": " + str);
        });
      })();
      
      let btn = new qx.ui.form.Button("Change Names");
      btn.addListener("execute", () => {
        model.forEach((item, index) => {
          item.setName("Renamed " + (index+1));
        });
      });
      doc.add(btn, {left: 100, top: 250});
    }
  }
});