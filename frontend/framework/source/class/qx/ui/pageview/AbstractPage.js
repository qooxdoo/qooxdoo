/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

qx.Clazz.define("qx.ui.pageview.AbstractPage",
{
  extend : qx.ui.layout.CanvasLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vButton)
  {
    this.base(arguments);

    if (vButton != null) {
      this.setButton(vButton);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** The attached tab of this page. */
    button :
    {
      _legacy : true,
      type    : "object"
    },


    /**
     * Make element displayed (if switched to true the widget will be created, if needed, too).
     *  Instead of qx.ui.core.Widget, the default is false here.
     */
    display :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyButton : function(propValue, propOldValue, propData)
    {
      if (propOldValue) {
        propOldValue.setPage(null);
      }

      if (propValue) {
        propValue.setPage(this);
      }

      return true;
    }
  }
});
