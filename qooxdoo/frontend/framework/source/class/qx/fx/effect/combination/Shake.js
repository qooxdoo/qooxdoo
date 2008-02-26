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
 * Combination effect "Shake"
 *
 * The given element will be moved forwards and backwards
 * several times.
 */
qx.Class.define("qx.fx.effect.combination.Shake",
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

    this._effect = new qx.fx.effect.core.Move(this._element);
  },

  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {
    /**
     * Direction in which the element should be shaken.
     */
    direction :
    {
      init : "horizontal",
      check : [ "horizontal", "vertical" ]
    },

    /**
     * Number of seconds the effect should run.
     */
    duration :
    {
      init : 0.5,
      refine : true
    },

    /**
     * Amount of pixel the element should be moved during the shake.
     */
    distance :
    {
      init : 20,
      check : "Number"
    }

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
        left   : qx.bom.element.Location.getLeft(this._element, "scroll")
      };
    },

    start : function()
    {
      this.base(arguments);

      var distance = parseFloat(this.getDistance());
      var split = parseFloat(this.getDuration()) / 10.0;

      if(this.getDirection() == "vertical")
      {
        this._effect.set({ y : distance,      x : 0, duration : split});
        this._effect.start();

        qx.lang.Function.delay(function(){
          this._effect.set({ y : -distance*2, x : 0, duration : split*2});
          this._effect.start();
        }, split*1000, this);

        qx.lang.Function.delay(function(){
          this._effect.set({ y : distance*2,  x : 0, duration : split*2});
          this._effect.start();
        }, split*2000, this);

        qx.lang.Function.delay(function(){
          this._effect.set({ y : -distance*2, x : 0, duration : split*2});
          this._effect.start();
        }, split*4000, this);

        qx.lang.Function.delay(function(){
          this._effect.set({ y : distance*2,  x : 0, duration : split*2});
          this._effect.start();
        }, split*6000, this);

        qx.lang.Function.delay(function(){
          this._effect.set({ y : -distance,   x : 0, duration : split*2});
          this._effect.start();
        }, split*8000, this);
      }
      else if(this.getDirection() == "horizontal")
      {
        this._effect.set({ x : distance,      y : 0, duration : split});
        this._effect.start();

        qx.lang.Function.delay(function(){
          this._effect.set({ x : -distance*2, y : 0, duration : split*2});
          this._effect.start();
        }, split*1000, this);

        qx.lang.Function.delay(function(){
          this._effect.set({ x : distance*2,  y : 0, duration : split*2});
          this._effect.start();
        }, split*2000, this);

        qx.lang.Function.delay(function(){
          this._effect.set({ x : -distance*2, y : 0, duration : split*2});
          this._effect.start();
        }, split*4000, this);

        qx.lang.Function.delay(function(){
          this._effect.set({ x : distance*2,  y : 0, duration : split*2});
          this._effect.start();
        }, split*6000, this);

        qx.lang.Function.delay(function(){
          this._effect.set({ x : -distance,   y : 0, duration : split*2});
          this._effect.start();
        }, split*8000, this);
      }

    }

   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this._disposeArray("_effects");
   }
});
