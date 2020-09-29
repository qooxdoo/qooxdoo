/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

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
 *     value: "A <b>long label</b> text with auto-wrapping. This also may contain <b style='color:red'>rich HTML</b> markup.",
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
 * <a href='http://qooxdoo.org/docs/#desktop/widget/label.md' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 *
 * NOTE: Instances of this class must be disposed of after use
 *
 */
qx.Class.define("qx.ui.basic.Label",
{
  extend : qx.ui.core.Widget,
  implement : [qx.ui.form.IStringForm],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {String} Text or HTML content to use
   */
  construct : function(value)
  {
    this.base(arguments);

    if (value != null) {
      this.setValue(value);
    }

    if (qx.core.Environment.get("qx.dynlocale")) {
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
      event : "changeRich",
      apply : "_applyRich"
    },


    /**
     * Controls whether text wrap is activated or not. But please note, that
     * this property works only in combination with the property {@link #rich}.
     * The {@link #wrap} has only an effect if the {@link #rich} property is
     * set to <code>true</code>, otherwise {@link #wrap} has no effect.
     */
    wrap :
    {
      check : "Boolean",
      init : true,
      apply : "_applyWrap"
    },


    /**
     * Controls whether line wrapping can occur in the middle of a word; this is
     * typically only useful when there is a restricted amount of horizontal space
     * and words would otherwise overflow beyond the width of the element.  Words
     * are typically considered as separated by spaces, so "abc/def/ghi" is a 11
     * character word that would not be split without `breakWithWords` set to true.
     */
    breakWithinWords :
    {
      check : "Boolean",
      init : false,
      apply : "_applyBreakWithinWords"
    },


    /**
     * Contains the HTML or text content. Interpretation depends on the value
     * of {@link #rich}. In text mode entities and other HTML special content
     * is not supported. But it is possible to use unicode escape sequences
     * to insert symbols and other non ASCII characters.
     */
    value :
    {
      check : "String",
      apply : "_applyValue",
      event : "changeValue",
      nullable : true
    },


    /**
     * The buddy property can be used to connect the label to another widget.
     * That causes two things:
     * <ul>
     *   <li>The label will always take the same enabled state as the buddy
     *       widget.
     *   </li>
     *   <li>A tap on the label will focus the buddy widget.</li>
     * </ul>
     * This is the behavior of the for attribute of HTML:
     * http://www.w3.org/TR/html401/interact/forms.html#adef-for
     */
    buddy :
    {
      check : "qx.ui.core.Widget",
      apply : "_applyBuddy",
      nullable : true,
      init : null,
      dereference : true
    },


    /** Control the text alignment */
    textAlign :
    {
      check : ["left", "center", "right", "justify"],
      nullable : true,
      themeable : true,
      apply : "_applyTextAlign",
      event : "changeTextAlign"
    },


    // overridden
    appearance :
    {
      refine: true,
      init: "label"
    },


    // overridden
    selectable :
    {
      refine : true,
      init : false
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
    },

    // overridden
    allowShrinkY :
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
    __tapListenerId : null,
    __webfontListenerId : null,



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
        this.__contentSize = this.__computeContentSize();
        delete this.__invalidContentSize;
      }

      return {
        width : this.__contentSize.width,
        height : this.__contentSize.height
      };
    },


    // overridden
    _hasHeightForWidth : function() {
      return this.getRich() && this.getWrap();
    },


    // overridden
    _applySelectable : function(value)
    {

      // This is needed for all browsers not having text-overflow:ellipsis
      // but supporting XUL (firefox < 4)
      // https://bugzilla.mozilla.org/show_bug.cgi?id=312156
      if (!qx.core.Environment.get("css.textoverflow") &&
        qx.core.Environment.get("html.xul"))
      {
        if (value && !this.isRich())
        {
          if (qx.core.Environment.get("qx.debug")) {
            this.warn("Only rich labels are selectable in browsers with Gecko engine!");
          }
          return;
        }
      }

      this.base(arguments, value);
    },


    // overridden
    _getContentHeightForWidth : function(width)
    {
      if (!this.getRich() && !this.getWrap()) {
        return null;
      }
      return this.__computeContentSize(width).height;
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

    /**
     * @type {Map} Internal fallback of label size when no font is defined
     *
     * @lint ignoreReferenceField(__contentSize)
     */
    __contentSize :
    {
      width : 0,
      height : 0
    },


    // property apply
    _applyFont : function(value, old)
    {
      if (old && this.__font && this.__webfontListenerId) {
        this.__font.removeListenerById(this.__webfontListenerId);
        this.__webfontListenerId = null;
      }
      // Apply
      var styles;
      if (value)
      {
        this.__font = qx.theme.manager.Font.getInstance().resolve(value);
        if (this.__font instanceof qx.bom.webfonts.WebFont) {
          this.__webfontListenerId = this.__font.addListener("changeStatus", this._onWebFontStatusChange, this);
        }
        styles = this.__font.getStyles();
      }
      else
      {
        this.__font = null;
        styles = qx.bom.Font.getDefaultStyles();
      }

      // check if text color already set - if so this local value has higher priority
      if (this.getTextColor() != null) {
        delete styles["color"];
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
     * @param width {Integer?null} Optional width constraint
     * @return {Map} Map with <code>width</code> and <code>height</code> keys
     */
    __computeContentSize : function(width)
    {
      var Label = qx.bom.Label;
      var font = this.getFont();

      var styles = font ? this.__font.getStyles() : qx.bom.Font.getDefaultStyles();
      var content = this.getValue() || "A";
      var rich = this.getRich();

      if (this.__webfontListenerId) {
        this.__fixEllipsis();
      }
      if (rich && this.getBreakWithinWords()) {
        styles.wordBreak = "break-all";
      }

      return rich ?
        Label.getHtmlSize(content, styles, width) :
        Label.getTextSize(content, styles);
    },



    /**
    * Firefox > 9 on OS X will draw an ellipsis on top of the label content even
    * though there is enough space for the text. Re-applying the content forces
    * a recalculation and fixes the problem. See qx bug #6293
    */
    __fixEllipsis : function()
    {
      if (!this.getContentElement()) {
        return;
      }
      if (qx.core.Environment.get("os.name") == "osx" &&
        qx.core.Environment.get("engine.name") == "gecko" &&
        parseInt(qx.core.Environment.get("engine.version"), 10) < 16 &&
        parseInt(qx.core.Environment.get("engine.version"), 10) > 9)
      {
        var domEl = this.getContentElement().getDomElement();
        if (domEl) {
          domEl.innerHTML = domEl.innerHTML;
        }
      }
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIER
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyBuddy : function(value, old)
    {
      if (old != null)
      {
        this.removeRelatedBindings(old);
        this.removeListenerById(this.__tapListenerId);
        this.__tapListenerId = null;
      }

      if (value != null)
      {
        value.bind("enabled", this, "enabled");
        this.__tapListenerId = this.addListener("tap", function() {
          // only focus focusable elements [BUG #3555]
          if (value.isFocusable()) {
            value.focus.apply(value);
          }
          // furthermore toggle if possible [BUG #6881]
          if ("toggleValue" in value && typeof value.toggleValue === "function") {
            value.toggleValue();
          }
        }, this);
      }
    },


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


    // property apply
     _applyWrap : function(value, old)
    {
      if (value && !this.isRich())
      {
        if (qx.core.Environment.get("qx.debug")) {
          this.warn("Only rich labels support wrap.");
        }
      }

      if (this.isRich()) {
        // apply the white space style to the label to force it not
        // to wrap if wrap is set to false [BUG #3732]
        var whiteSpace = value ? "normal" : "nowrap";
        this.getContentElement().setStyle("whiteSpace", whiteSpace);
      }
    },

    // property apply
    _applyBreakWithinWords : function(value, old) {
      if (this.isRich()) {
        this.getContentElement().setStyle("wordBreak", value ? "break-all" : "normal");
      }
    },


    /**
     * Locale change event handler
     *
     * @signature function(e)
     * @param e {Event} the change event
     */
    _onChangeLocale : qx.core.Environment.select("qx.dynlocale",
    {
      "true" : function(e)
      {
        var content = this.getValue();
        if (content && content.translate) {
          this.setValue(content.translate());
        }
      },

      "false" : null
    }),


    /**
     * Triggers layout recalculation after a web font was loaded
     *
     * @param ev {qx.event.type.Data} "changeStatus" event
     */
    _onWebFontStatusChange : function(ev)
    {
      if (ev.getData().valid === true) {

        // safari has trouble resizing, adding it again fixed the issue [BUG #8786]
        if (qx.core.Environment.get("browser.name") == "safari" &&
          parseFloat(qx.core.Environment.get("browser.version")) >= 8) {
            window.setTimeout(function() {
              this.__invalidContentSize = true;
              qx.ui.core.queue.Layout.add(this);
            }.bind(this), 0);
        }

        this.__invalidContentSize = true;
        qx.ui.core.queue.Layout.add(this);
      }
    },


    // property apply
    _applyValue : qx.core.Environment.select("qx.dynlocale", {
      "true" : function(value, old)
      {
        // Sync with content element
        if (value && value.translate) {
          this.getContentElement().setValue(value.translate());
        }
        else {
          this.getContentElement().setValue(value);
        }

        // Mark text size cache as invalid
        this.__invalidContentSize = true;

        // Update layout
        qx.ui.core.queue.Layout.add(this);
      },

      "false" : function(value, old)
      {
        this.getContentElement().setValue(value);

        // Mark text size cache as invalid
        this.__invalidContentSize = true;

        // Update layout
        qx.ui.core.queue.Layout.add(this);
      }
    })
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
    }

    if (this.__font && this.__webfontListenerId) {
      this.__font.removeListenerById(this.__webfontListenerId);
    }

    this.__font = null;
  }
});
