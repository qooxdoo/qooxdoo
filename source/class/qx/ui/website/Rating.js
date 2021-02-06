/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * This is a simple rating widget which can be used to display a predefined
 * number of symbols which the user can click or tap to give a rating e.g.
 * 3 out of 5 stars.
 *
 * <h2>Markup</h2>
 * Each rating item is a span element. Span elements already existing within
 * the Rating's container will be used, otherwise new elements will be added or
 * removed according to the <code>length</code> config option.
 *
 * <h2>CSS Classes</h2>
 * <table>
 *   <thead>
 *     <tr>
 *       <td>Class Name</td>
 *       <td>Applied to</td>
 *       <td>Description</td>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td><code>qx-rating</code></td>
 *       <td>Container element</td>
 *       <td>Identifies the Rating widget</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-rating-item</code></td>
 *       <td>Rating item (span)</td>
 *       <td>Identifies and styles an active Rating item</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-rating-item-off</code></td>
 *       <td>Rating item (span)</td>
 *       <td>Identifies and styles an inactive Rating item. Applied in addition to <code>qx-rating-item</code></td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * <h2 class="widget-markup">Generated DOM Structure</h2>
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Rating", {
  extend : qx.ui.website.Widget,


  statics : {
    /**
     * *length*
     *
     * The length of the rating widget.
     *
     * Default value: <pre>5</pre>
     *
     *
     * *symbol*
     *
     * The symbol used to render the rating items. This can be any
     * String e.g. a UTF-8 character.
     *
     * Default value: <pre>★</pre>
     */
    _config : {
      length : 5,
      symbol : "★"
    },


    /**
     * Factory method which converts the current collection into a collection of
     * rating widgets. Therefore, an initialization process needs to be done which
     * can be configured with some parameter.
     *
     * @param initValue {Number?0} The initial value of the rating.
     * @param symbol {String?"★"} The symbol which should be used for each rating item.
     * @param length {Number?5} The length of the rating widget.
     * @return {qx.ui.website.Rating} A new rating collection.
     * @attach {qxWeb}
     */
    rating : function(initValue, symbol, length) {
      var rating =  new qx.ui.website.Rating(this);
      rating.init();

      var modified = false;
      if (length != undefined && length != rating.getConfig("length")) {
        rating.setConfig("length", length);
        modified = true;
      }

      if (symbol != undefined) {
        rating.setConfig("symbol", symbol);
        modified = true;
      }

      if (modified) {
        rating.render();
      }

      if (initValue != undefined) {
        rating.setValue(initValue);
      }

      return rating;
    }
  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },


  events : {
    /** Fired at each value change */
    "changeValue" : "Number"
  },


  members : {

    // overridden
    init : function() {
      if (!this.base(arguments)) {
        return false;
      }

      this._updateSymbolLength();
      var cssPrefix = this.getCssPrefix();

      if (this.getAttribute("tabindex") < 0) {
        this.setAttribute("tabindex", 0);
      }
      this.on("focus", this._onFocus, this)
      .on("blur", this._onBlur, this)
      .getChildren("span")
        .addClasses([cssPrefix + "-item", cssPrefix + "-item-off"])
        .on("tap", this._onTap, this);

      return true;
    },


    /**
     * Sets the given value of the raining widget's in the collection. The value will be
     * converted to the maximum or minimum if our of range.
     *
     * @param value {Number} The value of the rating.
     * @return {qx.ui.website.Rating} <code>this</code> reference for chaining.
     */
    setValue : function(value) {
      if (this.getValue() == value) {
        return this;
      }
      if (value < 0) {
        value = 0;
      }
      var cssPrefix = this.getCssPrefix();

      var children = this.getChildren("span");
      children.removeClass(cssPrefix + "-item-off");
      children.slice(value, children.length).addClass(cssPrefix + "-item-off");
      this.emit("changeValue", this.getValue());
      return this;
    },


    /**
     * Reads the current value of the first rating widget in the collection
     * from the DOM and returns it.
     *
     * @return {Number} The current value.
     */
    getValue : function() {
      var cssPrefix = this.getCssPrefix();
      return this.getChildren("span").not("." + cssPrefix + "-item-off").length;
    },


    // overridden
    render : function() {
      this._updateSymbolLength();
    },


    /**
     * Checks the set length and adds / removes spans containing the rating symbol.
     *
     * @return {qx.ui.website.Rating} <code>this</code> reference for chaining.
     */
    _updateSymbolLength : function() {
      var cssPrefix = this.getCssPrefix();
      var length = this.getConfig("length");

      var children = this.getChildren();
      children.setHtml(this.getConfig("symbol"));
      var diff = length - children.length;
      if (diff > 0) {
        for (var i = 0; i < diff; i++) {
          qxWeb.create("<span>" + this.getConfig("symbol") + "</span>")
          .on("tap", this._onTap, this)
          .addClasses([cssPrefix + "-item", cssPrefix + "-item-off"])
          .appendTo(this);
        }
      } else {
        for (var i = 0; i < Math.abs(diff); i++) {
          this.getChildren().getLast()
          .off("tap", this._onTap, this)
          .remove();
        }
      }

      return this;
    },


    /**
     * Tap handler which updates the value depending on the selected element.
     *
     * @param e {Event} tap event
     */
    _onTap : function(e) {
      var parents = qxWeb(e.getTarget()).getParents();
      this.setValue(parents.getChildren().indexOf(e.getTarget()) + 1);
    },


    /**
     * Attaches the keydown listener.
     * @param e {Event} The native focus event.
     */
    _onFocus : function(e) {
      qxWeb(document.documentElement).on("keydown", this._onKeyDown, this);
    },


    /**
     * Removes the keydown listener if the widget loses focus.
     *
     * @param e {Event} The native blur event.
     */
    _onBlur : function(e) {
      qxWeb(document.documentElement).off("keydown", this._onKeyDown, this);
    },


    /**
     * Changes the value if the left or right arrow key is pressed.
     *
     * @param e {Event} The native keydown event.
     */
    _onKeyDown : function(e) {
      var key = e.getKeyIdentifier();
      if (key === "Right") {
        this.setValue(this.getValue() + 1);
      } else if (key === "Left") {
        this.setValue(this.getValue() - 1);
      }
    },


    // overridden
    dispose : function() {
      qxWeb(document.documentElement).off("keydown", this._onKeyDown, this);
      this.off("focus", this._onFocus, this)
      .off("blur", this._onBlur, this);
      this.getChildren("span").off("tap", this._onTap, this);
      this.setHtml("");

      return this.base(arguments);
    }
  },


  defer : function(statics) {
    qxWeb.$attach({rating : statics.rating});
  }
});
