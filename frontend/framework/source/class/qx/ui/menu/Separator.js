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

#module(ui_menu)

************************************************************************ */

qx.Class.define("qx.ui.menu.Separator",
{
  extend : qx.ui.layout.CanvasLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Fix IE Styling Issues
    this.setStyleProperty("fontSize", "0");
    this.setStyleProperty("lineHeight", "0");

    // ************************************************************************
    //   LINE
    // ************************************************************************
    this._line = new qx.ui.basic.Terminator;
    this._line.setAnonymous(true);
    this._line.setAppearance("menu-separator-line");
    this.add(this._line);

    // ************************************************************************
    //   EVENTS
    // ************************************************************************
    // needed to stop the event, and keep the menu showing
    this.addEventListener("mousedown", this._onmousedown);
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
      defaultValue : "menu-separator"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    hasIcon : qx.lang.Function.returnFalse,
    hasLabel : qx.lang.Function.returnFalse,
    hasShortcut : qx.lang.Function.returnFalse,
    hasMenu : qx.lang.Function.returnFalse,


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e) {
      e.stopPropagation();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {boolean | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return true;
      }

      if (this._line)
      {
        this._line.dispose();
        this._line = null;
      }

      return this.base(arguments);
    }
  }
});
