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

/* ************************************************************************
#asset(qx/icon/${qx.icontheme}/22/emotes/*)
************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.messenger.Roster",
{
  extend : qx.ui.virtual.form.WidgetList,

  construct : function()
  {
    this.base(arguments);

    this.set({
      scrollbarX: "off",
      scrollbarY: "auto",
      width: 200,
      height: 300,
      decorator: null
    });
    
    this._manager.setMode("single");

    this.groupPositions = {}
    this.groupPositions[0] = true;
    this.groupPositions[10] = true;
    
    this.getPane().getRowConfig().setDefaultItemSize(28);
    
    // Create controller
    var controller = new demobrowser.demo.virtual.messenger.Controller(null, this);
    this.bind("model", controller, "model");
    
    // render groups
    this.rowLayer = new qx.ui.virtual.layer.Row("white", "rgb(238, 243, 255)");
    this.getPane().addLayer(this.rowLayer);
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