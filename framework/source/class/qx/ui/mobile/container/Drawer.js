/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Creates a drawer widget inside the given parent widget. The parent widget can
 * be assigned as a constructor argument. If no parent is set, the application's
 * root will be assumed as parent. A drawer widget can be assigned to left, right,
 * top or bottom edge of its parent by property <code>orientation</code>. The drawer floats
 * in on <code>show()</code> and floats out on <code>hide()</code>. Additionally the drawer is shown by
 * swiping in reverse direction on the parent edge to where the drawer is placed
 * to: Orientation: <code>left</code>, Swipe: <code>right</code> on parents edge: Drawer is shown etc.
 * The drawer is hidden when user touches the parent area outside of the drawer.
 * This behaviour can be deactivated by the property <code>hideOnParentTouch</code>.
 *
 * <pre class='javascript'>
 *
 *  var drawer = new qx.ui.mobile.container.Drawer();
 *  drawer.setOrientation("right");
 *  drawer.setTouchOffset(100);
 *
 *  var button = new qx.ui.mobile.form.Button("A Button");
 *  drawer.add(button);
 * </pre>
 *
 *
 */
qx.Class.define("qx.ui.mobile.container.Drawer",
{
  extend : qx.ui.mobile.container.Composite,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param parent {qx.ui.mobile.container.Composite?null} The widget to which
   * the drawer should be added, if null it is added to app root.
   * @param layout {qx.ui.mobile.layout.Abstract?null} The layout that should be
   * used for this container.
   */
  construct : function(parent, layout)
  {
    this.base(arguments);

    if (layout) {
      this.setLayout(layout);
    }

    this.initOrientation();
    this.initPositionZ();

    if(parent) {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInstance(parent, qx.ui.mobile.container.Composite);
      }

      parent.add(this);
    } else {
      qx.core.Init.getApplication().getRoot().add(this);
    }

    this.__timers = [];

    this.__parent = this.getLayoutParent();
    this.__parent.addCssClass("drawer-parent");

    this.__parent.addListener("swipe", this._onParentSwipe,this);
    this.__parent.addListener("touchstart", this._onParentTouchStart,this);
    this.__parent.addListener("back", this.forceHide, this);

    this.__touchStartPosition = [0,0];
    this.__inAnimation = false;

    this.forceHide();
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired when the drawer changes its size.
     */
    resize : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    // overridden
    defaultCssClass : {
      refine : true,
      init : "drawer"
    },


    /** Property for setting the orientation of the drawer.
     * Allowed values are: <code>left</code>,<code>right</code>,<code>top</code>,<code>bottom</code> */
    orientation : {
      check : "String",
      init : "left",
      apply : "_applyOrientation"
    },


    /** The width of the drawer. Only relevant if orientation is <code>left</code> or <code>right</code>. */
    width : {
      check : "Integer",
      init : 300,
      apply : "_applySize",
      event : "resize"
    },


    /** The height of the drawer. Only relevant if orientation is <code>top</code> or <code>bottom</code>. */
    height : {
      check : "Integer",
      init : 300,
      apply : "_applySize",
      event : "resize"
    },


    /** Indicates whether the drawer should hide when the parent area of it is touched.  */
    hideOnParentTouch : {
      check : "Boolean",
      init : true
    },


    /** Sets the size of the touching area, where the drawer reacts on swipes for opening itself. */
    touchOffset : {
      check : "Integer",
      init : 20
    },


    /** The duration time of the transition between shown/hidden state in ms. */
    transitionDuration : {
      check : "Integer",
      init : 500,
      apply : "_applyTransitionDuration"
    },


    /** Sets the drawer zIndex position relative to its parent. */
    positionZ : {
      check : [ "above", "below"],
      init : "above",
      apply : "_applyPositionZ"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {
    __touchStartPosition : null,
    __parent : null,
    __inAnimation : null,
    __transitionEnabled : true,
    __timers : null,


    // property apply
    _applyOrientation : function(value, old) {
      this.removeCssClass(old);
      this.addCssClass(value);

      // Reapply width of height size depending on orientation.
      var isVertical = (this.getOrientation() == "left" || this.getOrientation() == "right");
      if(isVertical) {
        this._applySize(this.getHeight(), 0);
      } else {
        this._applySize(this.getWidth(), 0);
      }
    },


    // property apply
    _applyPositionZ : function(value,old) {
      this.removeCssClass(old);
      this.addCssClass(value);

      if(value == "above") {
        // Reset transitions for "below" mode.
        if(this.__parent) {
          this.__parent.setTranslateX(null);
          this.__parent.setTranslateY(null);
        }
        this.setTranslateX(null);
        this.setTranslateY(null);
      } else {
        this.__parent.setTranslateX(0);
        this.__parent.setTranslateY(0);
      }
    },


    // property apply
    _applySize : function(value, old) {
      var isVertical = this.getOrientation() =="left" || this.getOrientation() == "right";
      if(isVertical) {
        qx.bom.element.Style.set(this.getContainerElement(),"height", null);
        qx.bom.element.Style.set(this.getContainerElement(),"width", this.getWidth()+"px");
      } else {
        qx.bom.element.Style.set(this.getContainerElement(),"width", null);
        qx.bom.element.Style.set(this.getContainerElement(),"height", this.getHeight()+"px");
      }
    },


    // property apply
    _applyTransitionDuration : function(value,old) {
      this.__transitionEnabled = value > 0;
    },


    /**
     * Shows the drawer.
     */
    show : function()
    {
      if(this.__inAnimation) {
        return;
      }

      this.base(arguments);

      this._enableTransition();

      this._toggleParentBlockedState();

      if (this.getPositionZ() == "below") {
        if(this.__parent) {
          this.__parent.setTranslateX(0);
          this.__parent.setTranslateY(0);
        }

        this.setTranslateX(0);
        this.setTranslateY(0);

        if(this.getOrientation() == "left") {
          this.__parent.setTranslateX(this.getWidth());
          this.setTranslateX(-this.getWidth());
        } else if(this.getOrientation() == "right") {
          this.__parent.setTranslateX(-this.getWidth());
          this.setTranslateX(this.getWidth());
        } else if(this.getOrientation() == "top") {
          this.__parent.setTranslateY(this.getHeight());
          this.setTranslateY(-this.getHeight());
        } else if(this.getOrientation() == "bottom") {
          this.__parent.setTranslateY(-this.getHeight());
          this.setTranslateY(this.getHeight());
        }
      }

      // Delayed removal of hidden class, needed for iOS
      // soft keyboard bug.
      if(this.__transitionEnabled) {
        this.__timers.push(qx.event.Timer.once(function() {
        this.removeCssClass("hidden");
        }, this, 0));
      } else {
        this.removeCssClass("hidden");
      }


      this.__timers.push(qx.event.Timer.once(this._disableTransition, this, this.getTransitionDuration()));
    },


    /**
     * Toggles the blocked state of this drawer's parent.
     * Blocked means that no pointer events are received anymore.
     */
    _toggleParentBlockedState : function() {
      this.__parent.toggleCssClass("blocked");
    },


    /**
     * Hides the drawer.
     */
    hide : function() {
      if(this.__inAnimation) {
        return;
      }

      this._enableTransition();

      if (this.getPositionZ() == "below") {
        this.__parent.setTranslateX(0);
        this.__parent.setTranslateY(0);
      }

      this.addCssClass("hidden");

      this.__timers.push(qx.event.Timer.once(this._toggleParentBlockedState, this, this.getTransitionDuration()));
      this.__timers.push(qx.event.Timer.once(this._disableTransition, this, this.getTransitionDuration()));
      this.__timers.push(qx.event.Timer.once(this.exclude, this, this.getTransitionDuration()));
    },


    /**
     * Strict way to hide this drawer. Removes the blocker from the parent,
     * and hides the drawer without any animation. Should be called when drawer's
     * parent is animated and drawer should hide immediately.
     */
    forceHide : function() {
      this._disableTransition();

      if (this.getPositionZ() == "below") {
        this.__parent.setTranslateX(0);
        this.__parent.setTranslateY(0);
      }

      this.__parent.removeCssClass("blocked");

      this.addCssClass("hidden");
      this.exclude();
    },


    // overridden
    isHidden : function() {
      return this.hasCssClass("hidden");
    },


    /**
     * Enables the transition on this drawer.
     */
    _enableTransition : function() {
      if(!this.__transitionEnabled) {
        return;
      }

      this.__inAnimation = true;

      var target = null;
      if (this.getPositionZ() == "below") {
        target = this.__parent.getContentElement();
      } else {
        target = this.getContentElement();
      }

      qx.bom.element.Style.set(target, "transition", "all "+this.getTransitionDuration()+"ms ease-in-out");
    },


    /**
     * Disables the transition on this drawer.
     */
    _disableTransition : function() {
      if(!this.__transitionEnabled) {
        return;
      }

      this.__inAnimation = false;

      qx.bom.element.Style.set(this.getContentElement(),"transition", null);
      qx.bom.element.Style.set(this.__parent.getContentElement(),"transition", null);
    },


    /**
     * Toggle the visibility of the drawer.
     * @return {Boolean} the new visibility state.
     */
    toggleVisibility : function() {
      if(this.isHidden()) {
        this.show();
        return true;
      } else {
        this.hide();
        return false;
      }
    },


    /**
     * Handles a touch on application's root.
     * @param evt {qx.module.event.Touch} Handled touch event.
     */
    _onParentTouchStart : function(evt) {
      var clientX = evt.getAllTouches()[0].clientX;
      var clientY = evt.getAllTouches()[0].clientY;

      this.__touchStartPosition = [clientX,clientY];

      var isShown = !this.hasCssClass("hidden");
      if(isShown && this.isHideOnParentTouch()) {
        var location = qx.bom.element.Location.get(this.getContainerElement());

        if (this.getOrientation() =="left" && this.__touchStartPosition[0] > location.right
        || this.getOrientation() =="top" && this.__touchStartPosition[1] > location.bottom
        || this.getOrientation() =="bottom" && this.__touchStartPosition[1] < location.top
        || this.getOrientation() =="right" && this.__touchStartPosition[0] < location.left)
        {
          // First touch on overlayed page should be ignored.
          evt.preventDefault();

          this.hide();
        }
      }
    },


    /**
     * Handles a swipe on layout parent.
     * @param evt {qx.module.event.Touch} Handled touch event.
     */
    _onParentSwipe : function(evt) {
      var direction = evt.getDirection();
      var isHidden = this.hasCssClass("hidden");
      if(isHidden) {
        var location = qx.bom.element.Location.get(this.getContainerElement());

        if (
          (direction == "right"
          && this.getOrientation() == "left"
          && this.__touchStartPosition[0] < location.right + this.getTouchOffset()
          && this.__touchStartPosition[0] > location.right)
          ||
          (direction == "left"
          && this.getOrientation() == "right"
          && this.__touchStartPosition[0] > location.left - this.getTouchOffset()
          && this.__touchStartPosition[0] < location.left)
          ||
          (direction == "down"
          && this.getOrientation() == "top"
          && this.__touchStartPosition[1] < this.getTouchOffset() + location.bottom
          && this.__touchStartPosition[1] > location.bottom)
          ||
          (direction == "up"
          && this.getOrientation() == "bottom"
          && this.__touchStartPosition[1] > location.top - this.getTouchOffset()
          && this.__touchStartPosition[1] < location.top)
        )
        {
          this.show();
        }
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function()
  {
    this.__parent.removeListener("swipe", this._onParentSwipe, this);
    this.__parent.removeListener("touchstart", this._onParentTouchStart, this);
    this.__parent.removeListener("back", this.forceHide, this);

    qx.util.DisposeUtil.disposeArray(this, "__timers");

    this.__touchStartPosition = null;
    this.__inAnimation = null;
    this.__parent = null;
  }
});
