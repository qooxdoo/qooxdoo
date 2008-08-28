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
 * It supports simple text nodes and complex HTML (rich). The default
 * content mode is for text only. The mode is changeable through the property
 * {@link #rich}.
 *
 * The label supports heightForWidth when used in HTML mode. This means
 * that multi line HTML automatically computes the correct preferred height.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // a simple text label without wrapping and markup support
 *   var label1 = new qx.ui.basic.Label("Simple text label");
 *   this.getRoot().add(label1, {left:20, top:10});
 *
 *   // a HTML label with automatic line wrapping
 *   var label2 = new qx.ui.basic.Label().set({
 *     content: "A <b>long label</b> text with auto-wrapping. This also may contain <b style='color:red'>rich HTML</b> markup.",
 *     rich : true,
 *     width: 120
 *   });
 *   this.getRoot().add(label2, {left:20, top:50});
 * </pre>
 *
 * The first label in this example is a basic text only label. As such no
 * automatic wrapping is supported. The second label is a long label containing
 * HTML markup with automatic line wrapping.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/widget/Label' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 */
qx.Class.define("qx.ui.basic.Label",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param content {String} Text or HTML content to use
   */
  construct : function(content)
  {
    this.base(arguments);

    if (content != null) {
      this.setContent(content);
    }

    if (qx.core.Variant.isSet("qx.dynamicLocaleSwitch", "on")) {
      qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
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
     * Switches between rich HTML and text content. The text mode (<code>false</code>) supports
     * advanced features like ellipsis when the available space is not
     * enough. HTML mode (<code>true</code>) supports multi-line content and all the
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
     * of {@link #rich}. In text mode entities and other HTML special content
     * is not supported. But it is possible to use unicode escape sequences
     * to insert symbols and other non ASCII characters.
     */
    content :
    {
      check : "String",
      apply : "_applyContent",
      event : "changeContent",
      nullable : true
    },


    /** Control the text alignment */
    textAlign :
    {
      check : ["left", "center", "right"],
      nullable : true,
      themeable : true,
      apply : "_applyTextAlign"
    },


    // overridden
    appearance :
    {
      refine: true,
      init: "label"
    },


    // overridden
    allowGrowX :
    {
      refine : true,
      init : false
    },


    // overridden
    allowGrowY :
    {
      refine : true,
      init : false
    }

  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __font : null,
    __invalidContentSize : null,



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
    _hasHeightForWidth : function() {
      return this.getRich();
    },


    // overridden
    _getContentHeightForWidth : function(width)
    {
      if (!this.getRich()) {
        return null;
      }

      var styles = this.__font ? this.__font.getStyles() : qx.bom.Font.getDefaultStyles();

      return qx.bom.Label.getHtmlSize(this.getContent(), styles, width).height;
    },


    // overridden
    _createContentElement : function() {
      return new qx.html.Label;
    },


    // property apply
    _applyTextAlign : function(value, old) {
      this.getContentElement().setStyle("textAlign", value);
    },


    // overridden
    _applyTextColor : function(value, old)
    {
      if (value) {
        this.getContentElement().setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
      } else {
        this.getContentElement().removeStyle("color");
      }
    },




    /*
    ---------------------------------------------------------------------------
      LABEL ADDONS
    ---------------------------------------------------------------------------
    */

    /** {Map} Internal fallback of label size when no font is defined */
    __contentSize :
    {
      width : 0,
      height : 0
    },


    // property apply
    _applyFont : function(value, old)
    {
      // Apply
      var styles;
      if (value)
      {
        this.__font = qx.theme.manager.Font.getInstance().resolve(value);
        styles = this.__font.getStyles();
      }
      else
      {
        this.__font = null;
        styles = qx.bom.Font.getDefaultStyles();
      }

      this.getContentElement().setStyles(styles);

      // Invalidate text size
      this.__invalidContentSize = true;

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    },


    /**
     * Internal utility to compute the content dimensions.
     *
     * @return {void}
     */
    __computeContentSize : function()
    {
      var Label = qx.bom.Label;
      var font = this.getFont();

      var styles = font ? this.__font.getStyles() : qx.bom.Font.getDefaultStyles();
      var content = this.getContent() || "A";
      var rich = this.getRich();

      this.__contentSize = rich ?
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
      this.getContentElement().setRich(value);

      // Mark text size cache as invalid
      this.__invalidContentSize = true;

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    },


    _onChangeLocale : qx.core.Variant.select("qx.dynamicLocaleSwitch",
    {
      "on" : function(e)
      {
        var content = this.getContent();
        if (content.translate) {
          this.setContent(content.translate());
        }
      },

      "off" : null
    }),


    // property apply
    _applyContent : function(value)
    {
      // Sync with content element
      this.getContentElement().setContent(value);

      // Mark text size cache as invalid
      this.__invalidContentSize = true;

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (qx.core.Variant.isSet("qx.dynamicLocaleSwitch", "on")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
    }

    this._disposeFields("__font");
  }
});
