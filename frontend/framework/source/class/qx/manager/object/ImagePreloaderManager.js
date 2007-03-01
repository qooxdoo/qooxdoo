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

/** This singleton manage all qx.io.image.Preloader instances. */
qx.Class.define("qx.manager.object.ImagePreloaderManager",
{
  type : "singleton",
  extend : qx.manager.object.ObjectManager,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
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
      METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {void}
     */
    add : function(vObject) {
      this._objects[vObject.getUri()] = vObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {void}
     */
    remove : function(vObject) {
      delete this._objects[vObject.getUri()];
    },


    /**
     * TODOC
     *
     * @type member
     * @param vSource {var} TODOC
     * @return {var} TODOC
     */
    has : function(vSource) {
      return this._objects[vSource] != null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vSource {var} TODOC
     * @return {var} TODOC
     */
    get : function(vSource) {
      return this._objects[vSource];
    },


    /**
     * TODOC
     *
     * @type member
     * @param vSource {var} TODOC
     * @return {var} TODOC
     */
    create : function(vSource)
    {
      if (this._objects[vSource]) {
        return this._objects[vSource];
      }

      return new qx.io.image.Preloader(vSource);
    }
  }
});
