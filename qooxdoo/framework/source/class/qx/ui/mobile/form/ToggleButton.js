/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.form.ToggleButton",
{
  extend : qx.ui.mobile.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(value)
  {
    this.base(arguments);
    if (value) {
      this.setValue(value);
    }
    this.addListener("tap", this._onTap, this);
    this.addListener("swipe", this._onSwipe, this);
    // TODO: Add Child Control
    this.__child = this._createChild();
    this._add(this.__child);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    defaultCssClass :
    {
      refine : true,
      init : "toggleButton"
    },


    value :
    {
      check : "Boolean",
      init : false,
      apply : "_applyValue",
      event : "valueChanged"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __child : null,


    _getChild : function() {
      return this.__child;
    },


    _createChild : function() {
      return new qx.ui.mobile.container.Composite();
    },


    _applyValue : function(value, old)
    {
      if (value) {
        this._getChild().addCssClass("checked");
      } else {
        this._getChild().removeCssClass("checked");
      }
    },


    toggle : function() {
      this.setValue(!this.getValue());
    },


    _onTap : function(evt)
    {
      this.toggle();
    },


    _onSwipe : function(evt)
    {
      this.toggle();
    }
  },




 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.removeListener("tap", this._onTap, this);
    this.removeListener("swipe", this._onSwipe, this);
    this.__child = null;
  }
});
