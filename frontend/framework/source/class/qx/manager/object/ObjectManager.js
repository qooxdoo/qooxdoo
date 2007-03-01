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


************************************************************************ */

/** This class allows basic managment of assigned objects. */
qx.Class.define("qx.manager.object.ObjectManager",
{
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._objects = {};
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
      USER API
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {void | Boolean} TODOC
     */
    add : function(vObject)
    {
      if (this.getDisposed()) {
        return;
      }

      this._objects[vObject.toHashCode()] = vObject;
      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {void | Boolean} TODOC
     */
    remove : function(vObject)
    {
      if (this.getDisposed()) {
        return;
      }

      delete this._objects[vObject.toHashCode()];
      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {var} TODOC
     */
    has : function(vObject) {
      return this._objects[vObject.toHashCode()] != null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {var} TODOC
     */
    get : function(vObject) {
      return this._objects[vObject.toHashCode()];
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getAll : function() {
      return this._objects;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    enableAll : function()
    {
      for (var vHashCode in this._objects) {
        this._objects[vHashCode].setEnabled(true);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    disableAll : function()
    {
      for (var vHashCode in this._objects) {
        this._objects[vHashCode].setEnabled(false);
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

      if (this._objects)
      {
        for (var i in this._objects) {
          delete this._objects[i];
        }

        delete this._objects;
      }

      return this.base(arguments);
    }
  }
});
