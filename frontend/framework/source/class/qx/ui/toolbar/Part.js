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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * @appearance toolbar/part
 */
qx.Class.define("qx.ui.toolbar.Part",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.core.MRemoteChildrenHandling],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this._setLayout(new qx.ui.layout.HBox);

    this._createChildControl("handle");
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
      init : "toolbar/part"
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
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "handle":
          control = new qx.ui.core.Widget().set({
            width : 0,
            height : 0
          });
          this._add(control);
          break;

        case "container":
          control = new qx.ui.toolbar.PartContainer;
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    getChildrenContainer : function() {
      return this._getChildControl("container");
    }

  }

});
