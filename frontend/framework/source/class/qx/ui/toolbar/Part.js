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

  construct : function() 
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.HBox());
    this._add(new qx.ui.toolbar.PartHandle());
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

    /** Whether icons, labels, both or none should be shown. */
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
    /**
     * Add a item at the end of the toolbar
     *
     * @type member
     * @param item {qx.ui.core.Widget} widget to add
     */
    add: function(item) {
      this._add(item);
    }
  }
});
