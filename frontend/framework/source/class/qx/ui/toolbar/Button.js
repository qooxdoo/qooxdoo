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

#module(ui_toolbar)

************************************************************************ */

qx.Clazz.define("qx.ui.toolbar.Button",
{
  extend : qx.ui.form.Button,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vIcon, vIconWidth, vIconHeight, vFlash)
  {
    qx.ui.form.Button.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);

    // Omit focus
    this.setTabIndex(-1);
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
      _legacy      : true,
      type         : "string",
      defaultValue : "toolbar-button"
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

    _onkeydown : qx.lang.Function.returnTrue,
    _onkeyup   : qx.lang.Function.returnTrue
  }
});
