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

    /** Any text string which can contain TEXT, too */
    text :
    {
      check : "String",
      init : "",
      apply : "_modifyText",
      event : "changeText"
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
     * @return {Boolean} TODOC
     */
    _modifyText : function()
    {
      if (this._isCreated) {
        this._syncText();
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _applyFont : function(value, old) {
      qx.manager.object.FontManager.getInstance().connect(this._styleFont, this, value);
    },


    /**
     * @type member
     * @param value {qx.renderer.font.Font}
     */
    _styleFont : function(value) {
      value ? value.render(this) : qx.renderer.font.Font.reset(this);
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
      this.getElement().appendChild(document.createTextNode(this.getText()));
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _syncText : function() {
      this.getElement().firstChild.nodeValue = this.getText();
    }
  }
});
