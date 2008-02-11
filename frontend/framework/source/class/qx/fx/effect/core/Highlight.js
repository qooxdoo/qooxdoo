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
 * Core effect "Highlight"
 *
 * This effect cycles to background color from initial to final color.
 */
qx.Class.define("qx.fx.effect.core.Highlight",
{

  extend : qx.fx.Base,


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
        init : "#ffffff",
        check : "Color"
      },

      /**
       * Final background color value.
       */
      endColor :
      {
        init : "#ffffaa",
        check : "Color"
      },

      /**
       * Flag indicating if element's background color or image should be restored.
       */
      restoreColor :
      {
        init : true,
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

    setup : function()
    {
      this.base(arguments);

      this._oldStyle = {
        backgroundImage : qx.bom.element.Style.get(this._element, "backgroundImage"),
        backgroundColor : qx.bom.element.Style.get(this._element, "backgroundColor")
      };
      qx.bom.element.Style.set(this._element, "backgroundImage", "none");

      this._startColor = qx.util.ColorUtil.cssStringToRgb(this.getStartColor());
      this._endColor = qx.util.ColorUtil.cssStringToRgb(this.getEndColor());

      this._deltaColor = [
        this._endColor[0] - this._startColor[0],
        this._endColor[1] - this._startColor[1],
        this._endColor[2] - this._startColor[2]
      ];
    },


    update : function(position)
    {
      this.base(arguments);

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
      this.base(arguments);

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
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("_startColor", "_endColor", "_deltaColor");
  }

});

