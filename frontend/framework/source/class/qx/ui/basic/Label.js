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

/* ************************************************************************

#use(qx.locale.Manager)

************************************************************************ */

qx.Class.define("qx.ui.basic.Label",
{
  extend : qx.ui.core.Widget,




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
      apply : "_applyText",
      event : "changeText",
      nullable : true
    },

    html :
    {
      check : "String",
      apply : "_applyHtml",
      event : "changeHtml",
      nullable : true
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {qx.bom.Font} The current label font */
    __font : null,


    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _getContentHint : function()
    {
      var styles = {};
      if (this.__font) {
        styles = this.__font.getStyles();
      }

      var measured = this._htmlMode ?
        qx.bom.Label.getHtmlSize(this.getHtml() || "", styles) :
        qx.bom.Label.getTextSize(this.getText() || "", styles);

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
      if (!this._htmlMode) {
        return null;
      }

      return qx.bom.Label.getHtmlSize(this.getHtml(), null, width).height;
    },


    // overridden
    _createContentElement : function()
    {
      var el = new qx.html.Label;

      el.setHtmlMode(!!this._htmlMode);

      el.setStyle("position", "relative");
      el.setStyle("zIndex", 10);

      return el;
    },


    // overridden
    _applyFont : function(value, old)
    {
      qx.theme.manager.Font.getInstance().connect(function(font)
      {
        font ? font.render(this._contentElement) : qx.ui.core.Font.reset(this._contentElement);
        this.__font = font;
        this.scheduleLayoutUpdate();
      }, this, value);
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

      this._applyContent();
    },

    _applyText : function(value, old)
    {
      if (value) {
        delete this._htmlMode;
      }

      this._applyContent();
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
