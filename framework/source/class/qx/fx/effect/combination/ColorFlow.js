/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Rass (jonathan_rass)

   ======================================================================

   This class contains code based on the following work:

   * script.aculo.us
       http://script.aculo.us/
       Version 1.8.1

     Copyright:
       (c) 2008 Thomas Fuchs

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Author:
       Thomas Fuchs

************************************************************************ */

/**
 * Combination effect "Color Flow"
 *
 * It changes an element's background color to a given initial value and modifies it
 * step by step to the final value. After that the effects waits a given amount of time
 * before it modifies to background color back to the inital value.
 */

qx.Class.define("qx.fx.effect.combination.ColorFlow",
{

  extend : qx.fx.Base,

  /*
   *****************************************************************************
      CONSTRUCTOR
   *****************************************************************************
  */

  /**
   * @param element {Object} The DOM element
   */
  construct : function(element)
  {
    this.base(arguments, element);

    this.__highlightEffects = [
      new qx.fx.effect.core.Highlight(element),
      new qx.fx.effect.core.Highlight(element)
    ];

  },

  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {


    /**
     * Initial background color value.
     */
    startColor :
    {
      init  : "#ffffff",
      check : "Color"
    },


    /**
     * Final background color value.
     */
    endColor :
    {
      init  : "#ffffaa",
      check : "Color"
    },


    /**
     * Function for transition between start color and end color
     */
    forwardTransition :
    {
      init : "linear",

      // keep this in sync with qx.fx.Transition!
      check  : ["linear", "easeInQuad", "easeOutQuad", "sinodial", "reverse", "flicker", "wobble", "pulse", "spring", "none", "full"]
    },


    /**
     * Function for transition between end color and start color
     */
    backwardTransition :
    {
      init : "linear",

      // keep this in sync with qx.fx.Transition!
      check  : ["linear", "easeInQuad", "easeOutQuad", "sinodial", "reverse", "flicker", "wobble", "pulse", "spring", "none", "full"]
    },


    /**
     * Number of seconds the first transition should
     */
    forwardDuration :
    {
      init  : 1.0,
      check : "Number"
    },


    /**
     * Number of seconds the second transition should
     */
    backwardDuration :
    {
      init  : 1.0,
      check : "Number"
    },


    /**
     * Number of seconds the end color should be visible
     */
    delayBetween :
    {
      init  : 0.3,
      check : "Number"
    },


    /**
     * Flag indicating if element's background color or image should be restored.
     */
    restoreBackground :
    {
      init : true,
      check : "Boolean"
    },


    /**
     * Flag indicating if element's background image should consists during effect.
     * Useful for no-repeating background images.
     */
    keepBackgroundImage :
    {
      init : false,
      check : "Boolean"
    }

  },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

  members :
  {

    __oldStyle : null,
    __highlightEffects : null,

    start : function()
    {
      if (!this.base(arguments)) {
        return;
      }
      var element = this._getElement();

      this.setDuration(this.getForwardDuration() + this.getDelayBetween() + this.getBackwardDuration());

      this.__oldStyle = {
        backgroundImage : qx.bom.element.Style.get(element, "backgroundImage"),
        backgroundColor : qx.bom.element.Style.get(element, "backgroundColor")
      };

      this.__highlightEffects[0].set({
        startColor          : this.getStartColor(),
        endColor            : this.getEndColor(),
        duration            : this.getForwardDuration(),
        transition          : this.getForwardTransition(),
        restoreBackground   : false,
        keepBackgroundImage : this.getKeepBackgroundImage()
      });

      this.__highlightEffects[1].set({
        startColor          : this.getEndColor(),
        endColor            : this.getStartColor(),
        duration            : this.getBackwardDuration(),
        transition          : this.getBackwardTransition(),
        restoreBackground   : this.getRestoreBackground(),
        keepBackgroundImage : this.getKeepBackgroundImage(),
        delay               : this.getDelayBetween()
      });

      var self = this;
      this.__highlightEffects[0].afterFinishInternal = function() {
        self.__highlightEffects[1].start();
      }

      this.__highlightEffects[0].start();
    }
  },


 /*
 *****************************************************************************
    DESTRUCTOR
 *****************************************************************************
 */

  destruct : function() {
    this._disposeArray("__highlightEffects");
  }
});
