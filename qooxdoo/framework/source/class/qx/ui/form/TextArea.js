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
    },

    autoSizeMaxHeight :
    {
      check : "Integer",
      apply : "_applyAutoSizeMaxHeight",
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
      if (this.getContentElement().getDomElement() && this.isAutoSize()) {

        var clone = this.__getAreaClone();
        if (clone) {

          // Remember original area height
          // debugger;
          // this.__originalAreaHeight = this.__originalAreaHeight || this._getAreaHeight();
          // console.log("this.__originalAreaHeight", this.__originalAreaHeight);

          // Increase height when input triggers scrollbar
          var scrolledHeight = this._getScrolledAreaHeight();
          if (scrolledHeight != this._getAreaHeight()) {

            // Never shrink below original area height, or content hint height
            var minHeight = this.__originalAreaHeight || this._getContentHint().height;
            var desiredHeight = Math.max(scrolledHeight, minHeight);

            // Never grow widget above autoSizeMaxHeight, if defined
            if (this.getAutoSizeMaxHeight()) {
              var insets = this.getInsets();
              var maxHeight = -insets.top + this.getAutoSizeMaxHeight() - insets.bottom;

              // Should not be negative
              if (maxHeight < 0 ) {
                maxHeight = 0;
              }

              // Show scroll-bar when above autoSizeMaxHeight
              if (desiredHeight > maxHeight) {
                this.getContentElement().setStyle("overflowY", "auto");
              } else {
                this.getContentElement().setStyle("overflowY", "hidden");
              }

              desiredHeight = Math.min(desiredHeight, maxHeight);
            }

            this._setAreaHeight(desiredHeight);
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
      return parseInt(this.getContentElement().getStyle("height"), 10);
    },

    /**
    * Set actual height of textarea
    *
    * @param height {Integer} Desired height of textarea
    */
    _setAreaHeight: function(height) {
      if (this._getAreaHeight() !== height) {
        // Inner height is outer height minus vertical insets
        var insets = this.getInsets();
        var newOuterHeight = insets.top + height + insets.bottom;

        this.setHeight(newOuterHeight);
      }
    },

    /**
    * Get scrolled area height. Equals the total height of the textarea,
    * as if no scroll-bar was visible.
    *
    * @return {Integer} Height of scrolled area
    */
    _getScrolledAreaHeight: function() {
      var clone = this.__getAreaClone();

      // Make sure size is computed based on current value
      clone.setValue(this.getValue());
      clone.setWrap(this.getWrap(), true);

      this.__scrollCloneToBottom(clone);

      clone = clone.getDomElement();
      if (clone) {
        return clone.scrollTop;
      }
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

      orig = this.getContentElement();

      clone = new qx.html.Input("textarea");

      // Push out of view
      // Zero height (i.e. scrolled area equals height)
      clone.setStyles({
        position: "absolute",
        left: "-9999px",
        height: 0
      });

      // Set tab index
      clone.setAttribute("tabIndex", "-1");

      // Copy value
      clone.setValue(orig.getValue());

      // Attach to DOM
      clone.insertAfter(orig);
      qx.html.Element.flush();

      // Make sure scrollTop is actual height
      this.__scrollCloneToBottom(clone);

      return clone;
    },

    /**
    * Scroll textarea to bottom. That way, scrollTop reflects the height
    * of the textarea.
    *
    * @param area {Element} The textarea to scroll
    */
    __scrollCloneToBottom: function(clone) {
      var clone = clone.getDomElement();
      if (clone) {
        clone.scrollTop = 10000;
      }
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
      this.__autoSize();
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

    // property apply
    _applyAutoSizeMaxHeight: function() {
      if (this.__getAreaClone()) {
        this.__autoSize();
      }
    },

    // property apply
    _applyDimension : function() {
      this.base(arguments);

      var insets = this.getInsets();
      this.__originalAreaHeight =
        this.__originalAreaHeight || -insets.top + this.getHeight() -insets.bottom;
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
