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
qx.Class.define("qx.fx.effect.combination.Fold",
{

  extend : qx.fx.Base,

  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element)
  {
    this.base(arguments, element);

    this._outerScaleEffect = new qx.fx.effect.core.Scale(this._element);
    this._outerScaleEffect.set({
      scaleTo : 5,
      scaleContent: false,
      scaleX: false
    });


    this._innerScaleEffect = new qx.fx.effect.core.Scale(this._element);
    this._innerScaleEffect.set({
      scaleTo : 5,
      scaleContent: false,
      scaleY: false
    });

    var innerScaleEffectReference = this._innerScaleEffect;

    this._outerScaleEffect.afterFinishInternal = function() {
      innerScaleEffectReference.start();
    };

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
      this.base(arguments);

      this._oldStyle = {
        top    : qx.bom.element.Location.getTop(this._element, "scroll"),
        left   : qx.bom.element.Location.getLeft(this._element, "scroll"),
        width  : qx.bom.element.Dimension.getWidth(this._element),
        height : qx.bom.element.Dimension.getHeight(this._element)
      };
      qx.bom.element.Style.set(this._element, "overflow", "hidden");

      var oldStyleReference = this._oldStyle;

      this._innerScaleEffect.afterFinishInternal = function(effect)
      {
        qx.bom.element.Style.set(this._element, "display", "none");
        qx.bom.element.Style.set(this._element, "overflow", "visible");
        for (var property in oldStyleReference) {
          qx.bom.element.Style.set(this._element, property, oldStyleReference[property]);
        }
      };

    },

    start : function()
    {
      this.base(arguments);
      this._outerScaleEffect.start();
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


