/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * A card layout.
 *
 * The card layout lays out widgets in a stack. Call show to display a widget.
 * Only the widget which show method is called is displayed. All other widgets are excluded.
 *
 *
 * *Example*
 *
 * Here is a little example of how to use the Card layout.
 *
 * <pre class="javascript">
 * var layout = new qx.ui.mobile.layout.Card());
 * var container = new qx.ui.mobile.container.Composite(layout);
 *
 * var label1 = new qx.ui.mobile.basic.Label("1");
 * container.add(label1);
 * var label2 = new qx.ui.mobile.basic.Label("2");
 * container.add(label2);
 *
 * label2.show();
 * </pre>
 *
 * @use(qx.event.handler.Transition)
 */
qx.Class.define("qx.ui.mobile.layout.Card",
{
  extend : qx.ui.mobile.layout.Abstract,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);

    this.__cardAnimation = new qx.ui.mobile.layout.CardAnimation();
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the animation of a page transition starts */
    animationStart : "qx.event.type.Data",

    /** Fired when the animation of a page transition ends */
    animationEnd : "qx.event.type.Data"
  },


 /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The default animation to use for page transition */
    defaultAnimation :
    {
      check : "String",
      init : "slide"
    },


    /** Flag which indicates, whether animation is needed, or widgets should only swap. */
    showAnimation :
    {
      check : "Boolean",
      init : true
    },


    /** Transition duration of each animation. */
    animationDuration :
    {
      check : "Integer",
      init : 350
    }
  },


 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __nextWidget : null,
    __currentWidget : null,
    __inAnimation : null,
    __animation : null,
    __reverse : null,
    __cardAnimation : null,


    // overridden
    _getCssClasses : function() {
      return ["layout-card","qx-vbox"];
    },


    // overridden
    connectToChildWidget : function(widget)
    {
      this.base(arguments);
      if (widget) {
        widget.addCssClass("layout-card-item");
        widget.addCssClass("qx-flex1");
        widget.exclude();
      }
    },


    // overridden
    disconnectFromChildWidget : function(widget)
    {
      this.base(arguments);
      widget.removeCssClass("layout-card-item");
    },


    // overridden
    updateLayout : function(widget, action, properties)
    {
      if (action == "visible")
      {
        this._showWidget(widget, properties);
      }
      this.base(arguments, widget, action, properties);
    },


    /**
     * Setter for this.__cardAnimation.
     * @param value {qx.ui.mobile.layout.CardAnimation} the new CardAnimation object.
     */
    setCardAnimation : function(value) {
      this.__cardAnimation = value;
    },


    /**
     * Getter for this.__cardAnimation.
     * @return {qx.ui.mobile.layout.CardAnimation} the current CardAnimation object.
     */
    getCardAnimation : function() {
      return this.__cardAnimation;
    },


    /**
     * Shows the widget with the given properties.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget
     * @param properties {Map} The layout properties to set. Key / value pairs.
     */
    _showWidget : function(widget, properties)
    {
      if (this.__nextWidget == widget) {
        return;
      }

      if (this.__inAnimation) {
        this.__stopAnimation();
      }

      this.__nextWidget = widget;


      if (this.__currentWidget && this.getShowAnimation() && qx.core.Environment.get("css.transform.3d")) {
        properties = properties || {};

        // both are explicit identity checks for null
        if (properties.animation === null || this.getCardAnimation().getMap()[properties.animation] === null) {
          this._swapWidget();
          return;
        }

        this.__animation = properties.animation || this.getDefaultAnimation();

        if (properties.action && properties.action === "back") {
          this.__reverse = true;
        } else {
          properties.reverse = properties.reverse === null ? false : properties.reverse;
          this.__reverse = properties.reverse;
        }

        qx.bom.AnimationFrame.request(function() {
          this.__startAnimation(widget);
        }, this);
      } else {
        this._swapWidget();
      }
    },


    /**
     * Excludes the current widget and sets the next widget to the current widget.
     */
    _swapWidget : function() {
      if (this.__currentWidget) {
        this.__currentWidget.removeCssClass("active");
        this.__currentWidget.exclude();
      }
      this.__currentWidget = this.__nextWidget;
      this.__currentWidget.addCssClass("active");
    },


    /**
     * Fix size, only if widget has mixin MResize set,
     * and nextWidget is set.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget which should have a fixed size.
     */
    _fixWidgetSize : function(widget) {
      if(widget) {
        var hasResizeMixin = qx.Class.hasMixin(widget.constructor,qx.ui.mobile.core.MResize);
        if(hasResizeMixin) {
          // Size has to be fixed for animation.
          widget.fixSize();
        }
      }
    },


    /**
     * Releases recently fixed widget size (width/height). This is needed for allowing further
     * flexbox layouting.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget which should have a flexible size.
     */
    _releaseWidgetSize : function(widget) {
      if(widget) {
        var hasResizeMixin = qx.Class.hasMixin(widget.constructor,qx.ui.mobile.core.MResize);
        if(hasResizeMixin) {
          // Size has to be released after animation.
          widget.releaseFixedSize();
        }
      }
    },


    /**
     * Starts the animation for the page transition.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget
     */
    __startAnimation : function(widget)
    {
      if (widget.isDisposed()) {
        return;
      }
      // Fix size of current and next widget, then start animation.
      this.__inAnimation = true;

      this.fireDataEvent("animationStart", [this.__currentWidget, widget]);
      var fromElement = this.__currentWidget.getContainerElement();
      var toElement = widget.getContainerElement();

      qx.event.Registration.addListener(fromElement, "animationEnd", this._onAnimationEnd, this);
      qx.event.Registration.addListener(toElement, "animationEnd", this._onAnimationEnd, this);

      var fromCssClasses = this.__getAnimationClasses("out");
      var toCssClasses = this.__getAnimationClasses("in");

      this._widget.addCssClass("animationParent");

      var toElementAnimation = this.__cardAnimation.getAnimation(this.__animation, "in", this.__reverse);
      var fromElementAnimation = this.__cardAnimation.getAnimation(this.__animation, "out", this.__reverse);

      qx.bom.element.Class.addClasses(toElement, toCssClasses);
      qx.bom.element.Class.addClasses(fromElement, fromCssClasses);

      qx.bom.element.Animation.animate(toElement, toElementAnimation);
      qx.bom.element.Animation.animate(fromElement, fromElementAnimation);
    },


    /**
     * Event handler. Called when the animation of the page transition ends.
     *
     * @param evt {qx.event.type.Event} The causing event
     */
    _onAnimationEnd : function(evt)
    {
      this.__stopAnimation();
      this.fireDataEvent("animationEnd", [this.__currentWidget, this.__nextWidget]);
    },


    /**
     * Stops the animation for the page transition.
     */
    __stopAnimation : function()
    {
      if (this.__inAnimation)
      {
        var fromElement = this.__currentWidget.getContainerElement();
        var toElement = this.__nextWidget.getContainerElement();

        qx.event.Registration.removeListener(fromElement, "animationEnd", this._onAnimationEnd, this);
        qx.event.Registration.removeListener(toElement, "animationEnd", this._onAnimationEnd, this);

        qx.bom.element.Class.removeClasses(fromElement, this.__getAnimationClasses("out"));
        qx.bom.element.Class.removeClasses(toElement, this.__getAnimationClasses("in"));

        this._swapWidget();
        this._widget.removeCssClass("animationParent");
        this.__inAnimation = false;
      }
    },


    /**
     * Returns the animation CSS classes for a given direction. The direction
     * can be <code>in</code> or <code>out</code>.
     *
     * @param direction {String} The direction of the animation. <code>in</code> or <code>out</code>.
     * @return {String[]} The CSS classes for the set animation.
     */
    __getAnimationClasses : function(direction)
    {
      var classes = ["animationChild", this.__animation, direction];
      if (this.__reverse) {
        classes.push("reverse");
      }
      return classes;
    }
  },


  destruct : function() {
    this._disposeObjects("__cardAnimation");
  }
});
