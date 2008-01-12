/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

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
qx.Class.define("qx.io.image.PreloaderManager",
{
  type : "singleton",
  extend : qx.core.Object,




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
    /**
     * Adds a qx.io.image.Preloader instance to the manager
     *
     * @type member
     * @param vObject {Preloader} qx.io.image.Preloader instance
     * @return {void}
     */
    add : function(vObject) {
      this._objects[vObject.getUri()] = vObject;
    },


    /**
     * Removes a qx.io.image.Preloader instance from the manager
     *
     * @type member
     * @param vObject {Preloader} qx.io.image.Preloader instance
     * @return {void}
     */
    remove : function(vObject) {
      delete this._objects[vObject.getUri()];
    },


    /**
     * Returns whether an image preloader instance with the given source is registered
     *
     * @type member
     * @param vSource {String} Source of preloader image instance
     * @return {Boolean} whether an image preloader instance has given source
     */
    has : function(vSource) {
      return this._objects[vSource] != null;
    },


    /**
     * Return image preloader instance with given source
     *
     * @type member
     * @param vSource {String} Source of preloader image instance
     * @return {Preloader} qx.io.image.Preloader instance
     */
    get : function(vSource) {
      return this._objects[vSource];
    },


    /**
     * Create new qx.io.image.preloader instance with given source
     *
     * @type member
     * @param vSource {String} Source of preloader image instance
     * @return {Preloader} new qx.io.image.Preloader instance
     */
    create : function(vSource)
    {
      if (this._objects[vSource]) {
        return this._objects[vSource];
      }

      return new qx.io.image.Preloader(vSource);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_objects");
  }
});
