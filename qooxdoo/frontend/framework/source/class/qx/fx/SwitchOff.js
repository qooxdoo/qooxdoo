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

#module(core)

************************************************************************ */

/**
 * TODO
 */

qx.Class.define("qx.fx.SwitchOff",
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

    this._options.duration = 0.4;
    this._options.from = 0;
    this._options.transition = Effect.Transitions.flicker;
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
    /*

    afterFinishInternal: function(effect)
    {
      var scaleEffect = new qx.fx.Effect.Scale(effect.element, 1,
      { 

          duration: 0.3,

          scaleFromCenter: true,

          scaleX: false,

          scaleContent: false,

          restoreAfterFinish: true,

          beforeSetup: function(effect) { 
            effect.element.makePositioned().makeClipping();
          },

          afterFinishInternal: function(effect) {
            effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});
          }
      };
    }
      */
      
    //Effect.run();
  },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    
  }
});
