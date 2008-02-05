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

qx.Class.define("qx.fx.effect.combination.DropOut",
{

  extend : qx.fx.Base,

  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element, options)
  {
    this.base(arguments, element, options);
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

    afterFinishInternal : function()
    {
    console.info(this._element.style.top, this._element.style.left)
      for (var property in this._oldStyle) {
        qx.bom.element.Style.set(this._element, property, this._oldStyle[property]);
      }
      console.warn(this._element.style.top, this._element.style.left)
    },


    start : function()
    {
      this.base(arguments);

      this._oldStyle = {
        top  : qx.bom.element.Location.getTop(this._element, "scroll"),
        left : qx.bom.element.Location.getLeft(this._element, "scroll")
      };

      var moveEffect = new qx.fx.effect.core.Move(
        this._element,
        {
          x : 0,
          y : 100,
          sync : true
        }
      );

      var fadeEffect = new qx.fx.effect.core.FadeOut(
        this._element,
        {
          duration : 0.5,
          sync : true
        }
      );

      this._effect = new qx.fx.effect.core.Parallel(
        {
          1 : moveEffect,
          2 : fadeEffect
        }
      ).start();
      
      
      moveEffect.addListener("finish", function(){
        console.info(this._element.style.top, this._element.style.left)
        for (var property in this._oldStyle) {
          console.info(this._oldstyle)
          qx.bom.element.Style.set(this._element, property, this._oldStyle[property]);
        }
        console.error(this._element.style.top, this._element.style.left)
      });

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
