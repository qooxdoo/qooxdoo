/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The blocker element is used to block interaction with the application.
 *
 * It is usually transparent or semi-transparent and blocks all events from
 * the underlying elements.
 */
qx.Class.define("qx.html.Blocker",
{
  extend : qx.html.Element,

  /**
   * @param backgroundColor {Color?null} the blocker's background color. This
   *    color can be themed and will be resolved by the blocker.
   * @param opacity {Number?0} The blocker's opacity
   */
  construct : function(backgroundColor, opacity)
  {
    var backgroundColor = backgroundColor ?
        qx.theme.manager.Color.getInstance().resolve(backgroundColor) : null;

    var styles = {
      position: "absolute",
      opacity : opacity || 0,
      backgroundColor : backgroundColor
    };

    // IE needs some extra love here to convince it to block events.
    if ((qx.core.Environment.get("engine.name") == "mshtml"))
    {
      styles.backgroundImage = "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")";
      styles.backgroundRepeat = "repeat";
    }

    this.base(arguments, "div", styles);

    this.addListener("mousedown", this._stopPropagation, this);
    this.addListener("mouseup", this._stopPropagation, this);
    this.addListener("click", this._stopPropagation, this);
    this.addListener("dblclick", this._stopPropagation, this);
    this.addListener("mousemove", this._stopPropagation, this);
    this.addListener("mouseover", this._stopPropagation, this);
    this.addListener("mouseout", this._stopPropagation, this);
    this.addListener("mousewheel", this._stopPropagation, this);
    this.addListener("roll", this._stopPropagation, this);
    this.addListener("contextmenu", this._stopPropagation, this);
    this.addListener("pointerdown", this._stopPropagation, this);
    this.addListener("pointerup", this._stopPropagation, this);
    this.addListener("pointermove", this._stopPropagation, this);
    this.addListener("pointerover", this._stopPropagation, this);
    this.addListener("pointerout", this._stopPropagation, this);
    this.addListener("tap", this._stopPropagation, this);
    this.addListener("dbltap", this._stopPropagation, this);
    this.addListener("swipe", this._stopPropagation, this);
    this.addListener("longtap", this._stopPropagation, this);
    this.addListener("appear", this.__refreshCursor, this);
    this.addListener("disappear", this.__refreshCursor, this);
  },

  members :
  {
    /**
     * Stop the event propagation from the passed event.
     *
     * @param e {qx.event.type.Mouse} mouse event to stop propagation.
     */
    _stopPropagation : function(e) {
      e.stopPropagation();
    },


    /**
     * Refreshes the cursor by setting it to <code>null</code> and then to the
     * old value.
     */
    __refreshCursor : function() {
      var currentCursor = this.getStyle("cursor");
      this.setStyle("cursor", null, true);
      this.setStyle("cursor", currentCursor, true);
    }
  }
});
