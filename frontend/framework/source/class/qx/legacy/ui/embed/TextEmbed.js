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

qx.Class.define("qx.ui.embed.TextEmbed",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText)
  {
    this.base(arguments);

    if (vText != null) {
      this.setText(vText);
    }

    this.initWrap();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Any text string which can contain TEXT, too */
    text :
    {
      check : "String",
      init : "",
      apply : "_applyText",
      event : "changeText"
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

    /**
     * Whether the text should be automatically wrapped into the next line
     */
    wrap :
    {
      check : "Boolean",
      init : false,
      nullable : true,
      apply : "_applyWrap"
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
      TEXT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     */
    _applyText : function()
    {
      if (this._isCreated) {
        this._syncText();
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

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
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
      WRAP SUPPORT
    ---------------------------------------------------------------------------
    */

    _applyWrap : function(value, old) {
      value == null ? this.removeStyleProperty("whiteSpace") : this.setStyleProperty("whiteSpace", value ? "normal" : "nowrap");
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
      this._getTargetNode().appendChild(document.createTextNode(this.getText()));
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _syncText : function() {
      this._getTargetNode().firstChild.nodeValue = this.getText();
    }
  }
});
