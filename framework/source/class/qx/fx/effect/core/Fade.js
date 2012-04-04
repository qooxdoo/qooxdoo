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
     * Jonathan Weiß (jonathan_rass)

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
 * Core effect "Fade"
 *
 * Fades in the specified element: it changes to opacity from a given value to
 * another. If target value is 0, it will hide the element, if value is 1, it
 * will show it using the “display” property.
 * You can toggle this behavior using the "modifyDisplay" property:
 * {@link qx.fx.effect.core.Fade#modifyDisplay}.
 * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
 */

qx.Class.define("qx.fx.effect.core.Fade",
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
       * Flag indicating if the CSS attribute "display"
       * should be modified by effect
       * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
       */
      modifyDisplay :
      {
        init : true,
        check : "Boolean"
      },

      /**
       * Initial opacity value.
       * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
       */
      from :
      {
        init   : 1.0,
        refine : true
      },

      /**
       * Final opacity value.
       * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
       */
      to :
      {
        init   : 0.0,
        refine : true
      }

   },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

  members :
  {

    update : function(position)
    {
      this.base(arguments);

      if (qx.core.Environment.get("engine.name") == "mshtml" && position == 1) {
        // For IE it't better to remove the opacity filter instead of using it.
        qx.bom.element.Opacity.reset(this._getElement());
      } else {
        qx.bom.element.Opacity.set(this._getElement(), position);
      }
    },


    beforeSetup : function()
    {
      this.base(arguments);
      var element = this._getElement();

      if ( (this.getModifyDisplay()) && (this.getTo() > 0) ){
        qx.bom.element.Style.set(element, "display", "block");
      }
      qx.bom.element.Opacity.set(element, this.getFrom());
    },


    afterFinishInternal : function()
    {
      if ( (this.getModifyDisplay()) && (this.getTo() == 0) ){
        qx.bom.element.Style.set(this._getElement(), "display", "none");
      }
    }

  }

});