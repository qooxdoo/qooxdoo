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

/**
 * The label class brings typical text content to the widget system.
 *
 * It supports simple text nodes, but complex HTML as well. The default
 * content mode is for text. The mode is changable through the property
 * {@link #htmlMode}.
 *
 * The label supports heightForWidth when used in HTML mode. This means
 * that multiline HTML automatically computes the correct preferred height.
 */
qx.Class.define("qx.ui.basic.Label",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(content)
  {
    this.base(arguments);

    if (content != null) {
      this.setContent(content);
    }
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Switches between rich HTML and text content. The text mode supports
     * advanced features like ellipsis when the available space is not
     * enough. HTML mode supports multi-line content and all the
     * markup features of HTML content.
     */
    rich :
    {
      check : "Boolean",
      init : false,
      apply : "_applyRich"
    },


    /**
     * Contains the HTML or text content. Interpretation depends on the value
     * of {@link #rich}. In text mode (rich=off) entities and other HTML special content
     * is not supported. But it is possible to use unicode escape sequences
     * to insert symbols and other non ASCII characters.
     */
    content :
    {
      check : "String",
      apply : "_applyContent",
      event : "changeContent",
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
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _getContentHint : function()
    {
      if (this.__invalidContentSize)
      {
        this.__computeContentSize();
        delete this.__invalidContentSize;
      }

      return {
        width : this.__contentSize.width,
        height : this.__contentSize.height
      };
    },


    // overridden
    hasHeightForWidth : function() {
      return this.getRich();
    },


    // overridden
    _getContentHeightForWidth : function(width)
    {
      if (!this.getRich()) {
        return null;
      }

      return qx.bom.Label.getHtmlSize(this.getContent(), null, width).height;
    },


    // overridden
    _createContentElement : function() {
      return new qx.html.Label;
    },


    // overridden
    _applyFont : function(value, old) {
      qx.theme.manager.Font.getInstance().connect(this.__styleFont, this, value);
    },





    /*
    ---------------------------------------------------------------------------
      LABEL ADDONS
    ---------------------------------------------------------------------------
    */

    /** {qx.bom.Font} The current label font */
    __styledFont : null,


    /** {Map} Internal fallback of label size when no font is defined */
    __contentSize :
    {
      width : 0,
      height : 0
    },


    /**
     * Utility method to render the given font.
     *
     * @type member
     * @param font {qx.bom.Font} new font value to render
     * @return {void}
     */
    __styleFont : function(font)
    {
      // Apply
      var styles = font ? font.getStyles() : qx.bom.Font.getDefaultStyles();
      this._contentElement.setStyles(styles);

      // Store final value as well
      this.__styledFont = font;

      // Invalidate text size
      this.__invalidContentSize = true;

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    },


    /**
     * Internal utility to compute the content dimensions.
     *
     * @type member
     * @return {void}
     */
    __computeContentSize : function()
    {
      var Label = qx.bom.Label;

      var font = this.__styledFont;
      var styles = font ? font.getStyles() : null;
      var content = this.getContent() || "";

      this.__contentSize = this.getRich() ?
        Label.getHtmlSize(content, styles) :
        Label.getTextSize(content, styles);
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIER
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyRich : function(value)
    {
      // Sync with content element
      this._contentElement.setRich(value);

      // Mark text size cache as invalid
      this.__invalidContentSize = true;

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    },


    // property apply
    _applyContent : function(value)
    {
      // Sync with content element
      this._contentElement.setContent(value);

      // Mark text size cache as invalid
      this.__invalidContentSize = true;

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    }
  }
});
