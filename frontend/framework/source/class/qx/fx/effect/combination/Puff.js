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
qx.Class.define("qx.fx.effect.combination.Puff",
{

  extend : qx.fx.Base,

  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element, options)
  {
    if (qx.legacy.util.Validation.isValidObject(options)) {
      options.duration = 1.0;
    } else {
      options = {
        duration : 1.0
      }
    }

    this._effect = new qx.fx.effect.core.Parallel({
      0 : new qx.fx.effect.core.Scale(
          element,
          200,
          {
            sync : true,
            scaleFromCenter : true,
            scaleContent : true,
            restoreAfterFinish : true
          }
      ),
      1 : new qx.fx.effect.core.FadeOut(
          element,
          {
            sync: true,
            to: 0.0
          }
      )
    });

    this._element = element;
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

    setup : function()
    {
      this.base(arguments);

      this._oldStyle = {
        top    : qx.bom.element.Location.getTop(this._element, "scroll"),
        left   : qx.bom.element.Location.getLeft(this._element, "scroll"),
        width  : qx.bom.element.Dimension.getWidth(this._element),
        height : qx.bom.element.Dimension.getHeight(this._element)
      };
    },


    afterFinishInternal : function()
    {
      for(var property in this._oldStyle) {
        qx.bom.element.Style.set(this._element, property, this._oldStyle[property]);
      }
    },


    start : function()
    {
      this.base(arguments);

      this._effect.start();
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
