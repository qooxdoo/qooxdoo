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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Shared implementation for all root widgets.
 */
qx.Class.define("qx.ui.root.Abstract",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._focusHandler = new qx.ui.core.FocusHandler(this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "root"
    },

    // overridden
    enabled :
    {
      refine : true,
      init : true
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Adds a widget to the root.
     *
     * Please have a look at the constructor of the root for further
     * details about supported layout options.
     *
     * @type member
     * @param child {qx.ui.core.Widget} the widget to add
     * @return {qx.ui.root.Application} This object (for chaining support)
     */
    add : function(child, options)
    {
      this._add(child, options);

      // Chaining support
      return this;
    },


    /**
     * Remove child widget
     *
     * @type member
     * @param child {qx.ui.core.Widget} the widget to remove
     * @return {qx.ui.layout.Abstract} This object (for chaining support)
     */
    remove : function(child) {
      this._remove(child);
    },


    // overridden
    isRootWidget : function() {
      return true;
    },


    // overridden
    isLayoutRoot : function() {
      return true;
    },


    // overridden
    isFocusRoot : function() {
      return true;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_focusHandler");
  }
});
