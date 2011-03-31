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
 * The animation page manager displays the next page with an animation.
 * Is used automatically when transform3d is available.
 *
 * One of the following animations can be used:
 *
 *  <ul>
 *   <li>slide</li>
 *   <li>pop</li>
 *   <li>fade</li>
 *   <li>dissolve</li>
 *   <li>slideup</li>
 *   <li>flip</li>
 *   <li>swap</li>
 *   <li>cube</li>
 *  </ul>
 *
 */
qx.Class.define("qx.ui.mobile.page.manager.Animation",
{
  extend : qx.ui.mobile.page.manager.Simple,


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
      "slide" : true, // Todo: USE THIS FOR MORE INFORMATION
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
    __inAnimation : null,

    __animation : null,
    __reverse : null,
    __fromPage : null,
    __toPage : null,


    /**
     * Whether the manager is animating a page transition right now.
     *
     * @return {Boolean} In page transition or not.
     */
    isInAnimation : function()
    {
      return this.__inAnimation;
    },


    /**
     * Shows a certain registered page. The page transition will be animated.
     *
     * @param page {qx.ui.mobile.page.Page} The page to show
     * @param data {Map} The data for animation, e.g. {animation:"fade", reverse:true}
     */
    show : function(page, data)
    {
      if (this.__inAnimation) {
        return;
      }
      data = data || {};

      this.__animation = data.animation || this.getDefaultAnimation();

      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertNotUndefined(qx.ui.mobile.page.manager.Animation.ANIMATIONS[this.__animation], "Animation " + this.__animation + " is not defined.");
      }

      data.reverse = data.reverse == null ? false : data.reverse;

      this.__reverse = data.fromHistory || data.reverse;
      this.__fromPage = this.getCurrentPage();
      this.__toPage = page;

      this.base(arguments, page);
    },


    // overridden
    _removeCurrentPage : function()
    {
      this.__startAnimation();
    },


    /**
     * Starts the animation for the page transition.
     */
    __startAnimation : function()
    {
      this.__inAnimation = true;
      // TODO -> move animation code to an animation class
      this.fireDataEvent("animationStart", [this.__fromPage, this.__toPage]);
      var fromElement = this.__fromPage.getContainerElement();
      var toElement = this.__toPage.getContainerElement();

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
      this._getRoot().remove(this.__fromPage);
      this.__stopAnimation();
      this.fireDataEvent("animationEnd", [this.__fromPage, this.__toPage]);
    },


    /**
     * Stops the animation for the page transtion.
     */
    __stopAnimation : function()
    {
      if (this.__inAnimation)
      {
        var fromElement = this.__fromPage.getContainerElement();
        var toElement = this.__toPage.getContainerElement();

        qx.event.Registration.removeListener(fromElement, "animationEnd", this._onAnimationEnd, this);
        qx.event.Registration.removeListener(toElement, "animationEnd", this._onAnimationEnd, this);

        qx.bom.element.Class.removeClasses(fromElement, this.__getAnimationClasses("out"));
        qx.bom.element.Class.removeClasses(toElement, this.__getAnimationClasses("in"));
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
  },




 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__stopAnimation();
    this.__inAnimation = this.__animation, this.__reverse = null;
    this.__fromPage = this.__toPage = null;
  }
});