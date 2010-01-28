/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.messenger.Roster",
{
  extend : qx.ui.virtual.form.List,

  construct : function()
  {
    this.base(arguments);

    this.set({
      scrollbarX: "off",
      scrollbarY: "auto",
      width: 200,
      height: 300,
      rowHeight: 28,
      useWidgetCells: true,
      decorator: null
    });

    // Create controller
    var controller = new demobrowser.demo.virtual.messenger.Controller(null, this);
    this.bind("model", controller, "model");
    this.setSelection(controller.getSelection());

    // configure row colors
    this.rowLayer = this.getChildControl("row-layer");
    this.rowLayer.set({
      colorEven: "white",
      colorOdd: "rgb(238, 243, 255)"
    });
    this.getPane().addLayer(this.rowLayer);

    // Creates the prefetch behavior
    new qx.ui.virtual.behavior.Prefetch(
      this,
      0, 0, 0, 0,
      600, 800, 600, 800
    ).set({
      interval: 500
    });
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    model :
    {
      event : "changeModel",
      check : "qx.data.Array",
      nullable : true
    },

    selection :
    {
      event : "changeSelection"
    }
  },


  members :
  {
    styleGroup : function(row)
    {
      var groupColor = "rgb(60, 97, 226)";
      this.getPane().getRowConfig().setItemSize(row, 15);
      this.rowLayer.setColor(row, groupColor);
    },

    unstyleGroup : function(row)
    {
      this.getPane().getRowConfig().setItemSize(row, null);
      this.rowLayer.setColor(row, null);
    }
  }
});