/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

qx.Clazz.define("qx.renderer.border.BorderObject",
{
  extend : qx.renderer.border.Border,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vWidth, vStyle, vColor)
  {
    this._dependentObjects = {};

    this.base(arguments, vWidth, vStyle, vColor);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type static
     * @param vDefString {var} TODOC
     * @return {var} TODOC
     */
    fromString : function(vDefString)
    {
      var vBorder = new qx.renderer.border.BorderObject;
      var vAllParts = vDefString.split(/\s+/);
      var vPart, vTemp;

      for (var i=0; i<vAllParts.length; i++)
      {
        vPart = vAllParts[i];

        switch(vPart)
        {
          case "groove":
          case "ridge":
          case "inset":
          case "outset":
          case "solid":
          case "dotted":
          case "dashed":
          case "double":
          case "none":
            vBorder.setStyle(vPart);
            break;

          default:
            vTemp = parseFloat(vPart);

            if (vTemp == vPart || qx.lang.String.contains(vPart, "px")) {
              vBorder.setWidth(vTemp);
            }
            else
            {
              vPart = vPart.toLowerCase();
              vBorder.setColor(qx.renderer.color.Color.themedNames[vPart] ? new qx.renderer.color.ColorObject(vPart) : new qx.renderer.color.Color(vPart));
            }

            break;
        }
      }

      return vBorder;
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET CONNECTION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param o {Object} TODOC
     * @return {void}
     */
    addListenerWidget : function(o) {
      this._dependentObjects[o.toHashCode()] = o;
    },


    /**
     * TODOC
     *
     * @type member
     * @param o {Object} TODOC
     * @return {void}
     */
    removeListenerWidget : function(o) {
      delete this._dependentObjects[o.toHashCode()];
    },


    /**
     * TODOC
     *
     * @type member
     * @param vEdge {var} TODOC
     * @return {void}
     */
    _sync : function(vEdge)
    {
      var vAll = this._dependentObjects;
      var vCurrent;

      for (vKey in vAll)
      {
        vCurrent = vAll[vKey];

        if (vCurrent.isCreated()) {
          vCurrent._updateBorder(vEdge);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      if (typeof this._dependentObjects === "object")
      {
        var vAll = this._dependentObjects;

        for (vKey in vAll) {
          delete vAll[vKey];
        }

        vAll = null;
        delete this._dependentObjects;
      }

      return this.base(arguments);
    }
  }
});
