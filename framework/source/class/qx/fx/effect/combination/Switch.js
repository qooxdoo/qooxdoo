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
 * Combination effect "Switch Off"
 *
 * The given element will flicker one time and then
 * fold in.
 */

qx.Class.define("qx.fx.effect.combination.Switch",
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
    this.setTransition("flicker");

    var scaleEffect = this.__scaleEffect = new qx.fx.effect.core.Scale(element);

    this.__scaleEffect.beforeSetup = function() {
      qx.bom.element.Style.set(element, "overflow", "hidden");
    };

    this.__appearEffect = new qx.fx.effect.core.Fade(element);
    this.__appearEffect.afterFinishInternal = function() {
      scaleEffect.start();
    };

  },


  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {

    /**
    * Number of seconds the effect should run.
    */
    duration :
    {
      init   : 0.5,
      refine : true
    },

    /**
     * Initial opacity value
     */
    from :
    {
      init : 0.0,
      refine : true
    },

    /**
     * Final opacity value
     */
    to :
    {
      init : 1.0,
      refine : true
    },

    /**
     * Flag indicating if the CSS attribute "display"
     * should be modified by effect
     */
    modifyDisplay :
    {
      init : true,
      check : "Boolean"
    },

    /**
     * Mode indicating if effect should switch
     * element "on" or "off"
     */
    mode :
    {
      init : "off",
      check : [ "off" ]
      //check : [ "on", "off" ]
    }

  },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

  members :
  {

    __scaleEffect : null,
    __appearEffect : null,

    setup : function()
    {
      this.base(arguments);
      var element = this._getElement();

      var oldOverflow = qx.bom.element.Style.get(element, "overflow");

      this.__scaleEffect.afterFinishInternal = function()
      {
        qx.bom.element.Style.set(element, "overflow", oldOverflow);
      };

    },

    afterFinish : function()
    {
      if (this.getModifyDisplay() && (this.getMode() == "off")) {
        qx.bom.element.Style.set(this._getElement(), "display", "none");
      }
    },

    start : function()
    {
      if (!this.base(arguments)) {
        return;
      }


      if(this.getMode() == "off")
      {

        this.__scaleEffect.set({
          scaleTo            : 1.0,
          duration           : this.getDuration() / 2,
          scaleFromCenter    : true,
          scaleX             : false,
          scaleContent       : false,
          restoreAfterFinish : true
        });

        this.__appearEffect.set({
          duration : this.getDuration() / 2,
          from : this.getFrom(),
          to : 1
        });

      }
      else
      {
        // maybe later...
      }


      this.__appearEffect.start();
    },

    _applyDuration : function(value, old)
    {
      this.__scaleEffect.setDuration(value / 2);
      this.__appearEffect.setDuration(value / 2);
    }

  },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("__appearEffect", "__scaleEffect");
  }

});
