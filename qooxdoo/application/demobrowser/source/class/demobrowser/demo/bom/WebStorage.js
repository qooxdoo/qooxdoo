/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.WebStorage",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      // scroll container
      var scroller = new qx.ui.container.Scroll();
      var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      container.setAllowStretchX(false);
      scroller.add(container);
      this.getRoot().add(scroller, {edge : 0});

      var keyField = new qx.ui.form.TextField("key");
      var valueField = new qx.ui.form.TextField("value");

      var saveButton = new qx.ui.form.Button("Save");
      var clearButton = new qx.ui.form.Button("Clear");
      var removeButton = new qx.ui.form.Button("Remove");

      var list = new qx.ui.form.List();
      list.set({ height: 280, width: 245});


      container.add(keyField, {left: 20, top: 20});
      container.add(valueField, {left: 120, top: 20});

      container.add(saveButton, {left: 220, top: 18});
      container.add(list, {left: 20, top: 50});
      container.add(removeButton, {left: 20, top: 330});
      container.add(clearButton, {left: 220, top: 330});

      var local = qx.bom.storage.Local.getInstance();

      saveButton.addListener("click", function() {
        var key = keyField.getValue();
        var value = valueField.getValue();
        local.setItem(key, value);

        if (!list.findItem(key)) {
          list.add(new qx.ui.form.ListItem(key));
        }

        keyField.setValue("");
        valueField.setValue("");
        list.resetSelection();
        keyField.focus();
      }, this);

      removeButton.addListener("click", function() {
        var selected = list.getSelection()[0];
        if(selected) {
          local.removeItem(selected);
          list.remove(selected);
        }
      }, this);

      clearButton.addListener("click", function() {
        local.clear();
        list.removeAll();
      }, this);

      list.addListener("changeSelection", function(e) {
        var selection = e.getData();
        var item = selection[0];
        if (item) {
            var key = item.getLabel();
            var value = local.getItem(key);
            keyField.setValue(key);
            valueField.setValue(value);
        }
      });
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
  }
});
