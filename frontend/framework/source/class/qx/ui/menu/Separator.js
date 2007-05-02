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

/**
 * @appearance menu-separator
 * @appearance menu-separator-line {qx.ui.basic.Terminator}
 */
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

    this.initHeight();

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
    height :
    {
      refine : true,
      init : "auto"
    },

    appearance :
    {
      refine : true,
      init : "menu-separator"
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
     * @signature function()
     */
    hasIcon : qx.lang.Function.returnFalse,

    /**
     * @signature function()
     */
    hasLabel : qx.lang.Function.returnFalse,

    /**
     * @signature function()
     */
    hasShortcut : qx.lang.Function.returnFalse,

    /**
     * @signature function()
     */
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
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_line");
  }
});
