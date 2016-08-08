/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 *
 * @asset(showcase/virtuallist/down.png)
 * @asset(showcase/virtuallist/right.png)
 */

qx.Class.define("showcase.page.virtuallist.messenger.Group",
{
  extend : qx.ui.core.Widget,


  construct : function()
  {
    this.base(arguments);

    this.set({
      backgroundColor: "dark-blue",
      padding: [0, 3]
    });

    this._setLayout(new qx.ui.layout.HBox(3).set({
      alignY : "middle"
    }));

    this._add(this.getChildControl("icon"));
    this._add(this.getChildControl("label"), {flex : 1});
    this._add(this.getChildControl("count"));
  },


  properties :
  {
    open :
    {
      check : "Boolean",
      event : "changeOpen",
      apply : "_applyOpen",
      init : true
    },


    name :
    {
      check : "String",
      apply : "_applyName",
      init : ""
    },


    count :
    {
      check : "Integer",
      apply : "_applyCount",
      init : 0
    }
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "label" :
          control = new qx.ui.basic.Label().set({
            allowGrowX : true,
            textColor: "white",
            font: "bold"
          });
          break;
        case "icon" :
          control = new qx.ui.basic.Image("showcase/virtuallist/down.png");
          control.addListener("tap", this._onTap, this);
          break;
        case "count" :
          control = new qx.ui.basic.Label().set({
            textColor: "white",
            font: "bold"
          });
          break;
      }
      return control || this.base(arguments, id);
    },


    // apply method
    _applyOpen : function(value, old)
    {
      var source = "showcase/virtuallist/down.png";
      if (value == false) {
        source = "showcase/virtuallist/right.png";
      }

      this.getChildControl("icon").setSource(source);
    },


    // apply method
    _applyName : function(value, old) {
      this.getChildControl("label").setValue(value);
    },


    // apply method
    _applyCount : function(value, old) {
      this.getChildControl("count").setValue("(" + value + ")");
    },

    _onTap : function(event) {
      this.toggleOpen();
    }
  }
});
