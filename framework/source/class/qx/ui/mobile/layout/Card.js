/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/* ************************************************************************

#use(qx.event.handler.Transition)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * 
 */
qx.Class.define("qx.ui.mobile.layout.Card",
{
  extend : qx.ui.mobile.layout.Abstract,


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
    }
  },




 /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** All supported animations */
    ANIMATIONS :
    {
      "slide" : true,
      "pop" : true,
      "fade" : true,
      "dissolve" : true,
      "slideup" : true,
      "flip" : true,
      "swap" : true,
      "cube" : true
    }
  },


 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __widget : null,
    __activeWidget : null,
    __inAnimation : null,
    __animation : null,
    __reverse : null,


    // overridden
    _getCssClass : function() {
      return "layout-card";
    },
    
    
    // overridden
    connectToChildWidget : function(widget)
    {
      this.base(arguments);
      widget.addCssClass("layout-card-item");
      widget.exclude();
    },


    // overridden
    disconnectFromChildWidget : function(widget)
    {
      this.base(arguments);
      widget.removeCssClass("layout-card-item");
    },


    // overridden
    // TODO: Rethink order of parameters (action, widget, properties)
    updateLayout : function(widget, action, properties)
    {
      if (action == "visible")
      {
        this.__showWidget(widget, properties);
      }      
    },


    __showWidget : function(widget, properties)
    {
      if (this.__widget == widget) {
        return;
      }

      if (this.__inAnimation) {
        this.__stopAnimation();
      }
      
      this.__widget = widget;

      properties = properties || {};

      this.__animation = properties.animation || this.getDefaultAnimation();

      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertNotUndefined(qx.ui.mobile.layout.Card.ANIMATIONS[this.__animation], "Animation " + this.__animation + " is not defined.");
      }

      properties.reverse = properties.reverse == null ? false : properties.reverse;

      this.__reverse = properties.fromHistory || properties.reverse;

/*
 * TODO: Implement this
 */
/*
      if (qx.core.Environment.get("css.translate3d")) {
        
      } else {
        
      }
*/
      if (this.__activeWidget) {
         this.__startAnimation(widget);
      } else {
        this.__swapWidget();
      }
    },
    
    
    __swapWidget : function() {
      if (this.__activeWidget) {
        this.__activeWidget.exclude();
      }
      this.__activeWidget = this.__widget;
    },


    /**
     * Starts the animation for the page transition.
     */
    __startAnimation : function(widget)
    {
      this.__inAnimation = true;

      this.fireDataEvent("animationStart", [this.__activeWidget, widget]);
      var fromElement = this.__activeWidget.getContainerElement();
      var toElement = widget.getContainerElement();

      var fromCssClasses = this.__getAnimationClasses("out");
      var toCssClasses = this.__getAnimationClasses("in");

      qx.event.Registration.addListener(fromElement, "animationEnd", this._onAnimationEnd, this);
      qx.event.Registration.addListener(toElement, "animationEnd", this._onAnimationEnd, this);

      qx.bom.element.Class.addClasses(toElement, toCssClasses);
      qx.bom.element.Class.addClasses(fromElement, fromCssClasses);
    },


    /**
     * Event handler. Called when the animation of the page transition ends.
     *
     * @param evt {qx.event.type.Event} The causing event
     */
    _onAnimationEnd : function(evt)
    {
      this.__stopAnimation();
      this.fireDataEvent("animationEnd", [this.__activeWidget, this.__widget]);
    },


    /**
     * Stops the animation for the page transtion.
     */
    __stopAnimation : function()
    {
      if (this.__inAnimation)
      {
        var fromElement = this.__activeWidget.getContainerElement();
        var toElement = this.__widget.getContainerElement();

        qx.event.Registration.removeListener(fromElement, "animationEnd", this._onAnimationEnd, this);
        qx.event.Registration.removeListener(toElement, "animationEnd", this._onAnimationEnd, this);

        qx.bom.element.Class.removeClasses(fromElement, this.__getAnimationClasses("out"));
        qx.bom.element.Class.removeClasses(toElement, this.__getAnimationClasses("in"));
        
        this.__swapWidget();

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
      var classes = [this.__animation, direction];
      if (this.__reverse) {
        classes.push("reverse");
      }
      return classes;
    }
  }
});
