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
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Methods to place popup like widgets to other widgets, points,
 * pointer event coordinates, etc.
 */
qx.Mixin.define("qx.ui.core.MPlacement", {
  statics: {
    __visible: null,
    __direction: "left",

    /**
     * Set the always visible element. If an element is set, the
     * {@link #moveTo} method takes care of every move and tries not to cover
     * the given element with a movable widget like a popup or context menu.
     *
     * @param elem {qx.ui.core.Widget} The widget which should always be visible.
     */
    setVisibleElement(elem) {
      this.__visible = elem;
    },

    /**
     * Returns the given always visible element. See {@link #setVisibleElement}
     * for more details.
     *
     * @return {qx.ui.core.Widget|null} The given widget.
     */
    getVisibleElement() {
      return this.__visible;
    },

    /**
     * Set the move direction for an element which hides always visible element.
     * The value has only an effect when the {@link #setVisibleElement} is set.
     *
     * @param direction {String} The direction <code>left</code> or <code>top</code>.
     */
    setMoveDirection(direction) {
      if (direction === "top" || direction === "left") {
        this.__direction = direction;
      } else {
        throw new Error(
          "Invalid value for the parameter 'direction' " +
            "[qx.ui.core.MPlacement.setMoveDirection()], the value was '" +
            direction +
            "' " +
            "but 'top' or 'left' are allowed."
        );
      }
    },

    /**
     * Returns the move direction for an element which hides always visible element.
     * See {@link #setMoveDirection} for more details.
     *
     * @return {String} The move direction.
     */
    getMoveDirection() {
      return this.__direction;
    }
  },

  properties: {
    /**
     * Position of the aligned object in relation to the opener.
     *
     * Please note than changes to this property are only applied
     * when re-aligning the widget.
     *
     * The first part of the value is the edge to attach to. The second
     * part the alignment of the orthogonal edge after the widget
     * has been attached.
     *
     * The default value "bottom-left" for example means that the
     * widget should be shown directly under the given target and
     * then should be aligned to be left edge:
     *
     * <pre>
     * +--------+
     * | target |
     * +--------+
     * +-------------+
     * |   widget    |
     * +-------------+
     * </pre>
     */
    position: {
      check: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
        "left-top",
        "left-middle",
        "left-bottom",
        "right-top",
        "right-middle",
        "right-bottom"
      ],

      init: "bottom-left",
      themeable: true
    },

    /**
     * Whether the widget should be placed relative to an other widget or to
     * the pointer.
     */
    placeMethod: {
      check: ["widget", "pointer"],
      init: "pointer",
      themeable: true
    },

    /** Whether the widget should moved using DOM methods. */
    domMove: {
      check: "Boolean",
      init: false
    },

    /**
     * Selects the algorithm to place the widget horizontally. <code>direct</code>
     * uses {@link qx.util.placement.DirectAxis}, <code>keep-align</code>
     * uses {@link qx.util.placement.KeepAlignAxis} and <code>best-fit</code>
     * uses {@link qx.util.placement.BestFitAxis}.
     */
    placementModeX: {
      check: ["direct", "keep-align", "best-fit"],
      init: "keep-align",
      themeable: true
    },

    /**
     * Selects the algorithm to place the widget vertically. <code>direct</code>
     * uses {@link qx.util.placement.DirectAxis}, <code>keep-align</code>
     * uses {@link qx.util.placement.KeepAlignAxis} and <code>best-fit</code>
     * uses {@link qx.util.placement.BestFitAxis}.
     */
    placementModeY: {
      check: ["direct", "keep-align", "best-fit"],
      init: "keep-align",
      themeable: true
    },

    /** Left offset of the pointer (in pixel) */
    offsetLeft: {
      check: "Integer",
      init: 0,
      themeable: true
    },

    /** Top offset of the pointer (in pixel) */
    offsetTop: {
      check: "Integer",
      init: 0,
      themeable: true
    },

    /** Right offset of the pointer (in pixel) */
    offsetRight: {
      check: "Integer",
      init: 0,
      themeable: true
    },

    /** Bottom offset of the pointer (in pixel) */
    offsetBottom: {
      check: "Integer",
      init: 0,
      themeable: true
    },

    /** Offsets in one group */
    offset: {
      group: ["offsetTop", "offsetRight", "offsetBottom", "offsetLeft"],
      mode: "shorthand",
      themeable: true
    }
  },

  members: {
    __ptwLiveUpdater: null,
    __ptwLiveDisappearListener: null,
    __ptwLiveUpdateDisappearListener: null,
    /**@type {Record<"top" | "right" | "bottom" | "left", number> | null}*/
    __lastKnownCoords: null,
    __lastKnownSize: null,

    /**
     * Returns the location data like {qx.bom.element.Location#get} does,
     * but does not rely on DOM elements coordinates to be rendered. Instead,
     * this method works with the available layout data available in the moment
     * when it is executed.
     * This works best when called in some type of <code>resize</code> or
     * <code>move</code> event which are supported by all widgets out of the
     * box.
     *
     * @param widget {qx.ui.core.Widget} Any widget
     * @return {Map|null} Returns a map with <code>left</code>, <code>top</code>,
     *   <code>right</code> and <code>bottom</code> which contains the distance
     *   of the widget relative coords the document.
     */
    getLayoutLocation(widget) {
      // Use post-layout dimensions
      // which do not rely on the final rendered DOM element
      var insets, bounds, left, top;

      // Add bounds of the widget itself
      bounds = widget.getBounds();

      if (!bounds) {
        return null;
      }

      left = bounds.left;
      top = bounds.top;

      // Keep size to protect it for loop
      var size = bounds;

      // Now loop up with parents until reaching the root
      widget = widget.getLayoutParent();
      while (widget && !widget.isRootWidget()) {
        // Add coordinates
        bounds = widget.getBounds();
        left += bounds.left;
        top += bounds.top;

        // Add insets
        insets = widget.getInsets();
        left += insets.left;
        top += insets.top;

        // Next parent
        widget = widget.getLayoutParent();
      }

      // Add the rendered location of the root widget
      if (widget && widget.isRootWidget()) {
        var rootCoords = widget.getContentLocation();
        if (rootCoords) {
          left += rootCoords.left;
          top += rootCoords.top;
        }
      }

      // Build location data
      return {
        left: left,
        top: top,
        right: left + size.width,
        bottom: top + size.height
      };
    },

    /**
     * Sets the position. Uses low-level, high-performance DOM
     * methods when the property {@link #domMove} is enabled.
     * Checks if an always visible element is set and moves the widget to not
     * overlay the always visible widget if possible. The algorithm tries to
     * move the widget as far left as necessary but not of the screen.
     * ({@link #setVisibleElement})
     *
     * @param left {Integer} The left position
     * @param top {Integer} The top position
     */
    moveTo(left, top) {
      var visible = qx.ui.core.MPlacement.getVisibleElement();

      // if we have an always visible element
      if (visible) {
        var bounds = this.getBounds();
        var elemLocation = visible.getContentLocation();

        // if we have bounds for both elements
        if (bounds && elemLocation) {
          var bottom = top + bounds.height;
          var right = left + bounds.width;

          // horizontal placement wrong
          // each number is for the upcomming check (huge element is
          // the always visible, eleme prefixed)
          //     | 3 |
          //   ---------
          //   | |---| |
          //   |       |
          // --|-|   |-|--
          // 1 | |   | | 2
          // --|-|   |-|--
          //   |       |
          //   | |---| |
          //   ---------
          //     | 4 |
          if (
            right > elemLocation.left &&
            left < elemLocation.right &&
            bottom > elemLocation.top &&
            top < elemLocation.bottom
          ) {
            var direction = qx.ui.core.MPlacement.getMoveDirection();

            if (direction === "left") {
              left = Math.max(elemLocation.left - bounds.width, 0);
            } else {
              top = Math.max(elemLocation.top - bounds.height, 0);
            }
          }
        }
      }

      if (this.getDomMove()) {
        this.setDomPosition(left, top);
      } else {
        this.setLayoutProperties({ left: left, top: top });
      }
    },

    /**
     * Places the widget to another (at least laid out) widget. The DOM
     * element is not needed, but the bounds are needed to compute the
     * location of the widget to align to.
     *
     * @param target {qx.ui.core.Widget} Target coords align coords
     * @param liveupdate {Boolean} Flag indicating if the position of the
     * widget should be checked and corrected automatically.
     * @return {Boolean} true if the widget was successfully placed
     */
    placeToWidget(target, liveupdate) {
      // Use the idle event to make sure that the widget's position gets
      // updated automatically (e.g. the widget gets scrolled).
      if (liveupdate) {
        this.__cleanupFromLastPlaceToWidgetLiveUpdate();

        // Bind target and livupdate to placeToWidget
        this.__ptwLiveUpdater = qx.lang.Function.bind(
          this.placeToWidget,
          this,
          target,
          false
        );

        qx.event.Idle.getInstance().addListener(
          "interval",
          this.__ptwLiveUpdater
        );

        // Remove the listener when the element disappears.
        this.__ptwLiveUpdateDisappearListener = function () {
          this.__cleanupFromLastPlaceToWidgetLiveUpdate();
        };

        this.addListener(
          "disappear",
          this.__ptwLiveUpdateDisappearListener,
          this
        );
      }

      var coords =
        target.getContentLocation() || this.getLayoutLocation(target);
      var size = this.__getPlacementSize();

      if (coords != null) {

        const boundsAreEqual = (bound1, bound2) => bound1 && bound2 &&
          bound1.top === bound2.top &&
          bound1.right === bound2.right &&
          bound1.bottom === bound2.bottom &&
          bound1.left === bound2.left;

        if (boundsAreEqual(coords, this.__lastKnownCoords) &&
          boundsAreEqual(size, this.__lastKnownSize)) {
          return true;
        }

        this.__lastKnownCoords = coords;
        this.__lastKnownSize = size;
        this._place(coords);
        return true;
      } else {
        return false;
      }
    },

    /**
     * Removes all resources allocated by the last run of placeToWidget with liveupdate=true
     */
    __cleanupFromLastPlaceToWidgetLiveUpdate() {
      if (this.__ptwLiveUpdater) {
        qx.event.Idle.getInstance().removeListener(
          "interval",
          this.__ptwLiveUpdater
        );

        this.__ptwLiveUpdater = null;
      }

      if (this.__ptwLiveUpdateDisappearListener) {
        this.removeListener(
          "disappear",
          this.__ptwLiveUpdateDisappearListener,
          this
        );

        this.__ptwLiveUpdateDisappearListener = null;
      }
    },

    /**
     * Places the widget to the pointer position.
     *
     * @param event {qx.event.type.Pointer} Pointer event to align to
     */
    placeToPointer(event) {
      var left = Math.round(event.getDocumentLeft());
      var top = Math.round(event.getDocumentTop());

      var coords = {
        left: left,
        top: top,
        right: left,
        bottom: top
      };

      this._place(coords);
    },

    /**
     * Places the widget to any (rendered) DOM element.
     *
     * @param elem {Element} DOM element to align to
     * @param liveupdate {Boolean} Flag indicating if the position of the
     * widget should be checked and corrected automatically.
     */
    placeToElement(elem, liveupdate) {
      var location = qx.bom.element.Location.get(elem);
      var coords = {
        left: location.left,
        top: location.top,
        right: location.left + elem.offsetWidth,
        bottom: location.top + elem.offsetHeight
      };

      // Use the idle event to make sure that the widget's position gets
      // updated automatically (e.g. the widget gets scrolled).
      if (liveupdate) {
        // Bind target and livupdate to placeToWidget
        this.__ptwLiveUpdater = qx.lang.Function.bind(
          this.placeToElement,
          this,
          elem,
          false
        );

        qx.event.Idle.getInstance().addListener(
          "interval",
          this.__ptwLiveUpdater
        );

        // Remove the listener when the element disappears.
        this.addListener("disappear", () => {
          if (this.__ptwLiveUpdater) {
            qx.event.Idle.getInstance().removeListener(
              "interval",
              this.__ptwLiveUpdater
            );

            this.__ptwLiveUpdater = null;
          }
        });
      }

      this._place(coords);
    },

    /**
     * Places the widget in relation to the given point
     *
     * @param point {Map} Coordinate of any point with the keys <code>left</code>
     *   and <code>top</code>.
     */
    placeToPoint(point) {
      var coords = {
        left: point.left,
        top: point.top,
        right: point.left,
        bottom: point.top
      };

      this._place(coords);
    },

    /**
     * Returns the placement offsets as a map
     *
     * @return {Map} The placement offsets
     */
    _getPlacementOffsets() {
      return {
        left: this.getOffsetLeft(),
        top: this.getOffsetTop(),
        right: this.getOffsetRight(),
        bottom: this.getOffsetBottom()
      };
    },

    /**
     * Get the size of the object to place. The callback will be called with
     * the size as first argument. This methods works asynchronously.
     *
     * The size of the object to place is the size of the widget. If a widget
     * including this mixin needs a different size it can implement the method
     * <code>_computePlacementSize</code>, which returns the size.
     *
     *  @param callback {Function} This function will be called with the size as
     *    first argument. If it is null, the size is returned directly.
     */
    __getPlacementSize(callback) {
      var size = null;

      if (this._computePlacementSize) {
        var size = this._computePlacementSize();
      } else if (this.isVisible()) {
        var size = this.getBounds();
      }

      if (!callback) {
        return {...size};
      }

      if (size == null) {
        this.addListenerOnce("appear", () => {
          this.__getPlacementSize(callback);
        });
      } else {
        callback.call(this, size);
      }
    },

    /**
     * Internal method to read specific this properties and
     * apply the results to the this afterwards.
     *
     * @param coords {Map} Location of the object to align the this to. This map
     *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
     *   and <code>bottom</code>.
     */
    _place(coords) {
      this.__getPlacementSize(function (size) {
        var result = qx.util.placement.Placement.compute(
          size,
          this.getLayoutParent().getBounds(),
          coords,
          this._getPlacementOffsets(),
          this.getPosition(),
          this.getPlacementModeX(),
          this.getPlacementModeY()
        );

        // state handling for tooltips e.g.
        this.removeState("placementLeft");
        this.removeState("placementRight");
        this.addState(
          coords.left < result.left ? "placementRight" : "placementLeft"
        );

        this.moveTo(result.left, result.top);
      });
    }
  },

  destruct() {
    this.__cleanupFromLastPlaceToWidgetLiveUpdate();
  }
});
