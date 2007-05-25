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
qx.Class.define("qx.util.manager.Object",
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
        return false;
      }

      delete this._objects[vObject.toHashCode()];
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
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjectDeep("_objects");
  }
});
