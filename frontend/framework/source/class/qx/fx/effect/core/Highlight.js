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
qx.Class.define("qx.fx.effect.core.Highlight",
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
      startColor   : "#ffffff",
      endColor     : "#ffffaa",
      restoreColor : true
    };

    for(var i in effectSpecificOptions)
    {
      if (typeof(options[i]) == "undefined") {
        options[i] = effectSpecificOptions[i];
      }
    }

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

      this._oldStyle = {
        backgroundImage : qx.bom.element.Style.get(this._element, "backgroundImage"),
        backgroundColor : qx.bom.element.Style.get(this._element, "backgroundColor")
      };
      qx.bom.element.Style.set(this._element, "backgroundImage", "none");

      this._startColor = qx.util.ColorUtil.cssStringToRgb(this._options.startColor);
      this._endColor = qx.util.ColorUtil.cssStringToRgb(this._options.endColor);

      this._deltaColor = [
        this._endColor[0] - this._startColor[0],
        this._endColor[1] - this._startColor[1],
        this._endColor[2] - this._startColor[2]
      ];

    },


    update : function(position)
    {
      var color = [
        this._startColor[0] + Math.round(this._deltaColor[0] * position),
        this._startColor[1] + Math.round(this._deltaColor[1] * position),
        this._startColor[2] + Math.round(this._deltaColor[2] * position)
      ];

      var hexColor = "#" + color[0].toString(16) + color[1].toString(16) + color[2].toString(16);

      qx.bom.element.Style.set(this._element, "backgroundColor", hexColor);
    },


    finish : function()
    {
      qx.lang.Function.delay(this._restore, 1000, this);
    },


    _restore : function()
    {
      for(var property in this._oldStyle) {
        qx.bom.element.Style.set(this._element, property, this._oldStyle[property]);
      }
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
