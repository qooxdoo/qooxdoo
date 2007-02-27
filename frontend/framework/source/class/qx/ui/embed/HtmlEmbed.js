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

qx.Clazz.define("qx.ui.embed.HtmlEmbed",
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
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** Any text string which can contain HTML, too */
    html :
    {
      _legacy : true,
      type    : "string"
    },


    /** The font property describes how to paint the font on the widget. */
    font :
    {
      _legacy                : true,
      type                   : "object",
      instance               : "qx.renderer.font.Font",
      convert                : qx.renderer.font.FontCache.convert,
      allowMultipleArguments : true
    },


    /** Wrap the text? */
    wrap :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : true
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
     * @return {boolean} TODOC
     */
    _modifyHtml : function()
    {
      if (this._isCreated) {
        this._syncHtml();
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
     * @return {boolean} TODOC
     */
    _modifyFont : function(propValue, propOldValue, propData)
    {
      if (propValue) {
        propValue._applyWidget(this);
      } else if (propOldValue) {
        propOldValue._resetWidget(this);
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
     * @return {boolean} TODOC
     */
    _modifyWrap : function(propValue, propOldValue, propData)
    {
      this.setStyleProperty("whiteSpace", propValue ? "normal" : "nowrap");
      return true;
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
      this.getElement().innerHTML = this.getHtml();
    }
  }
});
