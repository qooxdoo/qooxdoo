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
   * Fabian Jakobs (fjakobs)
   * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.virtual.ListBinding",
{
  extend : qx.application.Standalone,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // create a list
      var list = new qx.ui.virtual.form.List();
      this.getRoot().add(list, {left: 10, top: 10});

      // build up the data
      var model = [];
      for (var i = 0; i < 10000; i++) {
        model.push("Affe " + i);
      }
      model = new qx.data.Array(model);

      // define a controller for the binding
      var controller = new qx.ui.virtual.form.ListController(model, list);
      controller.setDelegate({
        filter : function(model) {
          var inFilter;
          parseInt(model[model.length - 1]) % 2 ? inFilter = false : inFilter = true;
          return inFilter;
        },

        sorter : function(modelA, modelB) {
          return modelA > modelB;
        }
      });

      // create a list for the selection
      var selectedList = new qx.ui.virtual.form.List().set({
        useWidgetCells : true
      });
      this.getRoot().add(selectedList, {left: 500, top: 10});

      // create a controller for the selection
      new qx.ui.virtual.form.ListController(
        controller.getSelection(), selectedList
      );


      var buddyList = new qx.ui.virtual.form.List().set({
        useWidgetCells : true,
        cellRenderer : new demobrowser.demo.virtual.messenger.BuddyCell(),
        rowHeight : 28
      });

      var buddyModel = demobrowser.demo.virtual.messenger.BuddyModel.createBuddies(200);

      // create a controller
      new qx.ui.virtual.form.ListController(buddyModel, buddyList);

      this.getRoot().add(buddyList, {left: 10, top: 320});
    }
  }
});


