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

/** This singleton manage stuff around image handling. */
qx.Class.define("qx.io.image.Manager",
{
  type : "singleton",
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__visible = {};
    this.__all = {};
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Register an image.
     * Gives the application the possibility to preload images.
     *
     * @type member
     * @param source {String} The incoming (unresolved) URL.
     * @return {void}
     */
    add : function(source)
    {
      // this.debug("ADD: " + source);

      var data = this.__all;

      if (data[source] === undefined) {
        data[source] = 1;
      } else {
        data[source]++;
      }
    },


    /**
     * Register an image.
     * Gives the application the possibility to preload images.
     *
     * @type member
     * @param source {String} The incoming (unresolved) URL.
     * @return {void}
     */
    remove : function(source)
    {
      // this.debug("REMOVE: " + source);

      var data = this.__all;

      if (data[source] !== undefined) {
        data[source]--;
      }

      if (data[source] <= 0) {
        delete data[source];
      }
    },


    /**
     * Register an visible image.
     * Gives the application the possibility to preload visible images.
     *
     * @type member
     * @param source {String} The incoming (unresolved) URL.
     * @return {void}
     */
    show : function(source)
    {
      // this.debug("SHOW: " + source);

      var data = this.__visible;
      if (data[source] === undefined) {
        data[source] = 1;
      } else {
        data[source]++;
      }
    },


    /**
     * Register an image and reduce the visible counter
     * Warning: Only use after using show() before
     *
     * @type member
     * @param source {String} The incoming (unresolved) URL.
     * @return {void}
     */
    hide : function(source)
    {
      // this.debug("HIDE: " + source);

      var data = this.__visible;

      if (data[source] !== undefined) {
        data[source]--;
      }

      if (data[source]<=0) {
        delete data[source];
      }
    },


    /**
     * Returns a map with the sources of all visible images
     *
     * @type member
     * @return {Map} Map with sources of all visible images
     */
    getVisibleImages : function()
    {
      var visible = this.__visible;
      var list = {};

      for (var source in visible)
      {
        if (visible[source] > 0) {
          list[source] = true;
        }
      }

      return list;
    },


    /**
     * Returns a map with the sources of all hidden images
     *
     * @type member
     * @return {Map} Map with sources of all hidden images
     */
    getHiddenImages : function()
    {
      var visible = this.__visible;
      var all = this.__all;
      var list = {};

      for (var source in all)
      {
        if (visible[source] === undefined) {
          list[source] = true;
        }
      }

      return list;
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__all", "__visible");
  }
});
