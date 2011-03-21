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
 */
qx.Class.define("qx.ui.mobile.page.manager.Animation",
{
  extend : qx.ui.mobile.page.manager.Simple,

  construct : function(root)
  {
    this.base(arguments,root);
    this.__root = qx.core.Init.getApplication().getRoot();
  },

  events :
  {
    animationStart : "qx.event.type.Data",
    animationEnd : "qx.event.type.Data"
  },


  properties :
  {
    defaultAnimation :
    {
      check : "String",
      init : "slide"
    }
  },


  statics :
  {
    ANIMATIONS : {
      "slide" : true // USE THIS FOR MORE INFORMATION
    }
  },


  members :
  {
    __inAnimation : null,

    __animation : null,
    __reverse : null,
    __fromPage : null,
    __toPage : null,


    isInAnimation : function()
    {
      return this.__inAnimation;
    },


    // overridden
    show : function(page, data)
    {
      if (this.__inAnimation) {
        return;
      }
      data = data || {};

      this.__animation = data.animation || this.getDefaultAnimation();

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


    _onAnimationEnd : function(evt)
    {
      this._getRoot().remove(this.__fromPage);
      this.__stopAnimation();
      this.fireDataEvent("animationEnd", [this.__fromPage, this.__toPage]);
    },


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


    __getAnimationClasses : function(direction)
    {
      var classes = [this.__animation, direction];
      if (this.__reverse) {
        classes.push("reverse");
      }
      return classes;
    }
  },


  destruct : function()
  {
    this.__stopAnimation();
    this.__inAnimation = this.__animation, this.__reverse = null;
    this.__fromPage = this.__toPage = null;
  }
});