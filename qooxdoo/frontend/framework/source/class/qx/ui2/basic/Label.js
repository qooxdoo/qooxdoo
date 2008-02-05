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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.basic.Label",
{
  extend : qx.ui2.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(text)
  {
    this.base(arguments);

    if (text != null) {
      this.setText(text);
    }
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    text :
    {
      check : "String",
      apply : "_applyContent",
      event : "changeText"
    },

    html :
    {
      check : "String",
      apply : "_applyContent",
      event : "changeHtml"
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _getContentHint : function()
    {
      var measured = this._htmlMode ?
        qx.bom.Label.getHtmlSize(this.getHtml()) :
        qx.bom.Label.getTextSize(this.getText());

      return {
        width : measured.width,
        minWidth : 0,
        maxWidth : Infinity,
        height : measured.height,
        minHeight : 0,
        maxHeight : Infinity
      };
    },

    hasHeightForWidth : function() {
      return !!this._htmlMode;
    },

    _getContentHeightForWidth : function(width)
    {
      if (this._htmlMode) {
        return null;
      }

      return qx.bom.Label.getHtmlSize(this.getHtml(), null, width).height;
    },


    // overridden
    _createContentElement : function()
    {
      var el = new qx.html.Label;

      el.setUseHtml();

      el.setStyle("position", "relative");
      el.setStyle("zIndex", 10);

      return el;
    },







    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIER
    ---------------------------------------------------------------------------
    */

    _applyHtml : function(value, old)
    {
      if (value) {
        this._htmlMode = true;
      } else {
        delete this._htmlMode;
      }

      this.__applyContent();
    },

    _applyText : function(value, old)
    {
      if (value) {
        delete this._htmlMode;
      }

      this.__applyContent();
    },

    _applyContent : function()
    {
      var html = !!this._htmlMode;
      var value = html ? this.getHtml() : this.getText();

      this._contentElement.setHtmlMode(html);
      this._contentElement.setContent(value);

      this.scheduleLayoutUpdate();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {


  }
});
