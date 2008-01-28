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
 * TODO
 */
qx.Class.define("qx.fx.Puff",
{

  extend : qx.fx.Base,
  
  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element, options)
  {
  
    var opacity = qx.bom.element.Style.get(element, "opacity");

    this._oldStyle = {
      opacity  : qx.util.Validation.isValidNumber(opacity) ? opacity : "",
      position : qx.bom.element.Style.get(element, "position"),
      top      : qx.bom.element.Location.getTop(element, "scroll"),
      left     : qx.bom.element.Location.getLeft(element, "scroll"),
      width    : qx.bom.element.Dimension.getWidth(element),
      height   : qx.bom.element.Dimension.getHeight(element)
    };

    if (qx.util.Validation.isValidObject(options)) {
      options.duration = 1.0;
    } else {
      options = {
        duration : 1.0
      }
    }

    this._effect = new qx.fx.Parallel({
      0 : new qx.fx.Scale(
          element,
          200,
          {
            sync : true,
            scaleFromCenter : true,
            scaleContent : true,
            restoreAfterFinish : true
          }
      ),
      1 : new qx.fx.FadeOut(
          element,
          {
            sync: true,
            to: 0.0
          }
      )
    }); 

    this.element = element;
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

      beforeSetupInternal : function(effect)
      {
        //Position.absolutize(effect.effects[0].element)
      },


      afterFinishInternal : function(effect)
      {
        for(var property in this._oldStyle)
        {
          qx.bom.element.Style.set(this._element, property, this._oldStyle[property])
          qx.bom.element.Style.set(this._element, "display", "none");
        }
     },
     
     start : function()
     {
       this._effect.start();

       var queue = this._getQueue();
       qx.fx.queue.Manager.getInstance().getQueue(queue).add(this);
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
