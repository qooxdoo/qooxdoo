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
 * Core effect "Fade Out"
 *
 * This effect fades out the specified element:
 * it changes to opacity from 1.0 to a given value.
 */
qx.Class.define("qx.fx.effect.core.FadeOut",
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
     * Initial opacity value.
     */
    from :
    {
      init   : 1.0,
      refine : true
    },

    /**
     * Final opacity value.
     */
    to :
    {
      init   : 0.0,
      refine : true
    },

    /**
     * Flag indicating if the CSS attribute "display"
     * should be modified by effect
     */
    modifyDisplay :
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

    update : function(position)
    {
      this.base(arguments);
      qx.bom.element.Opacity.set(this._element, position);
    },


    beforeSetup : function()
    {
      this._oldOpacity = qx.bom.element.Style.get(this._element, "opacity");
      qx.bom.element.Style.set(this._element, "opacity", this.getFrom());
    },

    beforeFinish : function()
    {
      if (this.getModifyDisplay()) {
        qx.bom.element.Style.set(this._element, "display", "none");
      }

      qx.bom.element.Style.set(this._element, "opacity", this._oldOpacity);
    }

  }

});