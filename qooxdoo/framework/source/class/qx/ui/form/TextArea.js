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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The TextField is a multi-line text input field.
 */
qx.Class.define("qx.ui.form.TextArea",
{
  extend : qx.ui.form.AbstractField,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {String?""} The text area's initial value
   */
  construct : function(value)
  {
    this.base(arguments, value);
    this.initWrap();

    this.addListener("mousewheel", this._onMousewheel, this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Controls whether text wrap is activated or not. */
    wrap :
    {
      check : "Boolean",
      init : true,
      apply : "_applyWrap"
    },

    // overridden
    appearance :
    {
      refine : true,
      init : "textarea"
    },

    /** Factor for scrolling the <code>TextArea</code> with the mouse wheel. */
    singleStep :
    {
      check : "Integer",
      init : 20
    },

    /**
    * Whether the textarea should automatically grow or shrink when content
    * does not fit.
    */
    autoSize :
    {
      check : "Boolean",
      apply : "_applyAutoSize",
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
    __areaClone : null,
    __originalAreaHeight : null,

    // overridden
    setValue : function(value)
    {
      value = this.base(arguments, value);
      this.__autoSize();

      return value;
    },

    /**
     * Handles the mouse wheel for scrolling the <code>TextArea</code>.
     *
     * @param e {qx.event.type.MouseWheel} mouse wheel event.
     */
    _onMousewheel : function(e) {
      var contentElement = this.getContentElement();
      var scrollY = contentElement.getScrollY();

      contentElement.scrollToY(scrollY + e.getWheelDelta() * this.getSingleStep());

      var newScrollY = contentElement.getScrollY();

      if (newScrollY != scrollY) {
        e.stop();
      }
    },

    /*
    ---------------------------------------------------------------------------
      AUTO SIZE
    ---------------------------------------------------------------------------
    */

    /**
    * Set height of textarea so that content fits without scroll bar.
    *
    * @return {void}
    */
    __autoSize: function() {
      if (this.isAutoSize()) {
        var value = this.getValue();

        // Make sure size is computed based on current value
        var clone = this.__getAreaClone();
        if (clone) {
          clone.value = value;
          this.__scrollCloneToBottom(clone);

          // Remember original area height
          this.__originalAreaHeight = this.__originalAreaHeight || this._getAreaHeight();

          // Increase height when input triggers scrollbar
          var scrolledHeight = this._getScrolledAreaHeight();
          if (scrolledHeight != this._getAreaHeight()) {
            // Never shrink below original height
            this._setAreaHeight(Math.max(scrolledHeight, this.__originalAreaHeight));
          }
        }
      }
    },

    /**
    * Get actual height of textarea
    *
    * @return {Integer} Height of textarea
    */
    _getAreaHeight: function() {
      var area = this.getContentElement().getDomElement();
      var style = qx.bom.element.Style;
      return parseInt(style.get(area, "height", style.COMPUTED_MODE));
    },

    /**
    * Set actual height of textarea
    *
    * @param height {Integer} Desired height of textarea
    */
    _setAreaHeight: function(height) {
      // Inner height is outer height minus vertical insets
      var insets = this.getInsets();
      var newOuterHeight = insets.top + height + insets.bottom;
      this.setHeight(newOuterHeight);
    },

    /**
    * Get scrolled area height. Equals the total height of the textarea,
    * as if no scroll-bar was visible.
    *
    * @return {Integer} Height of scrolled area
    */
    _getScrolledAreaHeight: function() {
      var clone = this.__getAreaClone();

      return clone.scrollTop;
    },

    /**
    * Returns the hidden area clone.
    *
    * @return {Element} DOM Element
    */
    __getAreaClone: function() {
      this.__areaClone = this.__areaClone || this.__createAreaClone();
      return this.__areaClone;
    },

    /**
    * Creates and hides area clone.
    *
    * @return {Element} DOM Element
    */
    __createAreaClone: function() {
      var orig,
          clone;

      orig = qx.bom.Collection.create(this.getContentElement().getDomElement());
      clone = orig.clone();

      // Push out of view
      // Zero height (i.e. scrolled area equals height)
      clone.setStyles({
        position: "absolute",
        left: "-9999px",
        height: 0
      });

      // Reset attributes
      clone.resetAttribute("id").resetAttribute("name").
            setAttribute("tabIndex", "-1");

      // Copy value
      clone.setValue(orig.getValue());

      // Make sure scrollTop is actual height
      this.__scrollCloneToBottom(clone[0]);

      // Attach to DOM, but outside container
      orig.parent().before(clone);

      return clone[0];
    },

    /**
    * Scroll textarea to bottom. That way, scrollTop reflects the height
    * of the textarea.
    *
    * @param area {Element} The textarea to scroll
    */
    __scrollCloneToBottom: function(area) {
      area.scrollTop = 10000;
    },

    /*
    ---------------------------------------------------------------------------
      FIELD API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createInputElement : function()
    {
      return new qx.html.Input("textarea", {
        overflowX: "auto",
        overflowY: "auto"
      });
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyWrap : function(value, old) {
      this.getContentElement().setWrap(value);
    },

    // property apply
    _applyAutoSize: function(value, old) {
      if (value) {
        this.addListener("input", this.__autoSize, this);

        // This is done asynchronously on purpose. The style given would
        // otherwise be overridden by the DOM changes queued in the
        // property apply for wrap. See [BUG #4493] for more details.
        this.addListenerOnce("appear", function() {
          this.getContentElement().setStyle("overflowY", "hidden");
        });

      } else {
        this.removeListener("input", this.__autoSize);
        this.getContentElement().setStyle("overflowY", "auto");
      }

    },

    /*
    ---------------------------------------------------------------------------
      LAYOUT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getContentHint : function()
    {
      var hint = this.base(arguments);

      // four lines of text by default
      hint.height = hint.height * 4;

      // 20 character wide
      hint.width = this._getTextSize().width * 20;

      return hint;
    }
  }
});
