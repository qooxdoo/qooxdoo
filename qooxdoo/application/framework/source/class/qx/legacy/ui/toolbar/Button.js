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
 * @appearance toolbar-button
 */
qx.Class.define("qx.legacy.ui.toolbar.Button",
{
  extend : qx.legacy.ui.form.Button,





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // Omit focus
    tabIndex :
    {
      refine : true,
      init : -1
    },

    appearance :
    {
      refine : true,
      init : "toolbar-button"
    },

    show :
    {
      refine : true,
      init : "inherit"
    },

    height :
    {
      refine : true,
      init : null
    },

    allowStretchY :
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
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * @signature function()
     */
    _onkeydown : qx.lang.Function.returnTrue,

    /**
     * @signature function()
     */
    _onkeyup   : qx.lang.Function.returnTrue
  }
});
