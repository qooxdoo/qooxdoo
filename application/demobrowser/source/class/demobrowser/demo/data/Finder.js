/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/data/finder.json)

************************************************************************ */

/**
 * @tag databinding
 */
qx.Class.define("demobrowser.demo.data.Finder",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create and configure a window
      var win = new qx.ui.window.Window("Finder");
      win.setLayout(new qx.ui.layout.HBox());
      win.setContentPadding(0);
      win.setShowMaximize(false);
      win.setShowMinimize(false);
      win.setShowClose(false);
      // open the window
      win.open();

      // create and add the lists
      var list1 = new qx.ui.form.List();
      win.add(list1);
      var list2 = new qx.ui.form.List();
      win.add(list2);
      var list3 = new qx.ui.form.List();
      win.add(list3);


      // create the controllers, one for each list
      // and set the name in the data for the label
      var controller1 = new qx.data.controller.List(null, list1);
      controller1.setLabelPath("name");
      var controller2 = new qx.data.controller.List(null, list2);
      controller2.setLabelPath("name");
      var controller3 = new qx.data.controller.List(null, list3);
      controller3.setLabelPath("name");

      // create the data store
      var url = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/data/finder.json");
      var store = new qx.data.store.Json(url);

      // connect the store and the first controller
      store.bind("model.files", controller1, "model");
      // connect the rest of the controllers
      controller1.bind("selection[0].files", controller2, "model");
      controller2.bind("selection[0].files", controller3, "model");

    }
  }
});
