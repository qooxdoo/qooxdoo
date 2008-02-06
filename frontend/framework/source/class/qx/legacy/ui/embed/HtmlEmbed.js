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

#module(ui_basic)

************************************************************************ */

qx.Class.define("qx.ui.embed.HtmlEmbed",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vHtml)
  {
    this.base(arguments);

    if (vHtml != null) {
      this.setHtml(vHtml);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Any text string which can contain HTML, too */
    html :
    {
      check : "String",
      init : "",
      apply : "_applyHtml",
      event : "changeHtml"
    },


    /**
     * The alignment of the text inside the box
     */
    textAlign :
    {
      check : [ "left", "center", "right", "justify" ],
      nullable : true,
      themeable : true,
      apply : "_applyTextAlign"
    },


    /** Block inheritance as default for font property */
    font :
    {
      refine : true,
      init : null
    },


    /** Block inheritance as default for textColor property */
    textColor :
    {
      refine : true,
      init : null
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
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     */
    _applyHtml : function()
    {
      if (this._isCreated) {
        this._syncHtml();
      }
    },





    /*
    ---------------------------------------------------------------------------
      TEXTALIGN SUPPORT
    ---------------------------------------------------------------------------
    */

    _applyTextAlign : function(value, old) {
      value === null ? this.removeStyleProperty("textAlign") : this.setStyleProperty("textAlign", value);
    },





    /*
    ---------------------------------------------------------------------------
      FONT SUPPORT
    ---------------------------------------------------------------------------
    */

    _applyFont : function(value, old) {
      qx.theme.manager.Font.getInstance().connect(this._styleFont, this, value);
    },


    /**
     * @type member
     * @param value {qx.ui.core.Font}
     */
    _styleFont : function(value) {
      value ? value.render(this) : qx.ui.core.Font.reset(this);
    },




    /*
    ---------------------------------------------------------------------------
      TEXT COLOR SUPPORT
    ---------------------------------------------------------------------------
    */

    _applyTextColor : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleTextColor, this, value);
    },

    /**
     * @type member
     * @param value {var} any acceptable CSS color property
     */
    _styleTextColor : function(value) {
      value ? this.setStyleProperty("color", value) : this.removeStyleProperty("color");
    },




    /*
    ---------------------------------------------------------------------------
      ELEMENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _applyElementData : function() {
      this._syncHtml();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _syncHtml : function() {
      this._getTargetNode().innerHTML = this.getHtml();
    }
  }
});
