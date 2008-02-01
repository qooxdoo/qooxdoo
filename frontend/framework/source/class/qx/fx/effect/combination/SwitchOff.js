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

/* ************************************************************************

#require(qx.fx.Base)
#require(qx.fx.Transition)

************************************************************************ */

/**
 * TODO
 */

qx.Class.define("qx.fx.effect.combination.SwitchOff",
{

  extend : qx.fx.Base,

  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element, options)
  {

    var effectSpecificOptions = {
      duration   : 0.4,
      from       : 0,
      transition : qx.fx.Transition.flicker
    };

    for(var i in effectSpecificOptions)
    {
      if (typeof(options[i]) == "undefined") {
        options[i] = effectSpecificOptions[i];
      }
    }

    this.base(arguments, element, options);
    this._element = element;
  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
  },

  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

   members :
   {

    setup : function()
    {
      this._oldOverflow = qx.bom.element.Style.get(this._element, "overflow");
    },

    start : function()
    {
      var scaleEffect = new qx.fx.effect.core.Scale(
        this._element,
        1,
        {
          duration           : 0.3,
          scaleFromCenter    : true,
          scaleX             : false,
          scaleContent       : false,
          restoreAfterFinish : true
        }
      );

      scaleEffect.beforeSetup = function() {
        qx.bom.element.Style.set(this._element, "overflow", "hidden");
      };

      scaleEffect.afterFinishInternal = function() {
        qx.bom.element.Style.set(this._element, "overflow", this._oldOverflow);
        qx.bom.element.Style.set(this._element, "display", "none");
      };

      this._appearEffect = new qx.fx.effect.core.FadeOut(this._element, this._options);

      this._appearEffect.afterFinishInternal = function() {
        scaleEffect.start();
      };

      this._appearEffect.start();
    }

   },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {

  }
});
