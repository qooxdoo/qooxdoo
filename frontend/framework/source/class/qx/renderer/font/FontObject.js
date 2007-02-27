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

#module(ui_basic)

************************************************************************ */

qx.Clazz.define("qx.renderer.font.FontObject",
{
  extend : qx.renderer.font.Font,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vSize, vName)
  {
    this._dependentObjects = {};

    this.base(arguments, vSize, vName);
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
          vCurrent._updateFont(vEdge);
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
        for (vKey in this._dependentObjects) {
          delete this._dependentObjects[vKey];
        }

        delete this._dependentObjects;
      }

      return this.base(arguments);
    }
  }
});
