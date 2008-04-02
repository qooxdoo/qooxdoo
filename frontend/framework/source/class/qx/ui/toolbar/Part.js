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
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_toolbar)

************************************************************************ */

/**
 * @appearance toolbar-part
 */
qx.Class.define("qx.ui.toolbar.Part",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);

    this._layout = new qx.ui.layout.HBox();
    this._handle = new qx.ui.toolbar.PartHandle();
    this._layout.add(this._handle);
    this.setLayout(this._layout);

    // this.initWidth();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    appearance :
    {
      refine : true,
      init : "toolbar-part"
    },

    show :
    {
      init : "inherit",
      check : [ "both", "label", "icon", "none"],
      nullable : true,
      inheritable : true,
      event : "changeShow"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    add: function(item) {
      this._layout.add(item);
    }
  },

  

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_handle");
  }
});
