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
      restoreBackground :
      {
        init : true,
        check : "Boolean"
      },

      /**
       * Flag indicating if element's background image should consists during effect.
       * Useful for no-repeating background images.
       */
      keepBackgroundImage :
      {
        init : false,
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

    __oldStyle : null,
    __startColor : null,
    __endColor : null,
    __deltaColor : null,

    setup : function()
    {
      this.base(arguments);
      var element = this._getElement();

      this.__oldStyle = {
        backgroundImage : qx.bom.element.Style.get(element, "backgroundImage"),
        backgroundColor : qx.bom.element.Style.get(element, "backgroundColor")
      };

      if (!this.getKeepBackgroundImage()) {
        qx.bom.element.Style.set(element, "backgroundImage", "none");
      }

      this.__startColor = qx.util.ColorUtil.cssStringToRgb(this.getStartColor());
      this.__endColor = qx.util.ColorUtil.cssStringToRgb(this.getEndColor());

      this.__deltaColor = [
        this.__endColor[0] - this.__startColor[0],
        this.__endColor[1] - this.__startColor[1],
        this.__endColor[2] - this.__startColor[2]
      ];
    },

    update : function(position)
    {
      this.base(arguments);

      var color = [
        this.__startColor[0] + Math.round(this.__deltaColor[0] * position),
        this.__startColor[1] + Math.round(this.__deltaColor[1] * position),
        this.__startColor[2] + Math.round(this.__deltaColor[2] * position)
      ];

      var hexColor = "#" + qx.util.ColorUtil.rgbToHexString([color[0].toString(16), color[1].toString(16), color[2].toString(16)]);

      qx.bom.element.Style.set(this._getElement(), "backgroundColor", hexColor);
    },


    finish : function()
    {
      this.base(arguments);

      if (this.getRestoreBackground()) {
        qx.lang.Function.delay(this._restore, 1000, this);
      }
    },


    /**
     * Helper function to restore style attributes
     * to the state before the effect was started.
     */
    _restore : function()
    {
      var element = this._getElement();
      for(var property in this.__oldStyle) {
        qx.bom.element.Style.set(element, property, this.__oldStyle[property]);
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
    this._disposeFields("__startColor", "__endColor", "__deltaColor");
  }

});

