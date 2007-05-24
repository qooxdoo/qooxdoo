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
qx.Class.define("qx.manager.object.ImageManager",
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

    this.__sources = {};
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
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
      var data = this.__sources;
      data[source] === undefined ? data[source] = 1 : data[source]++;
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
      var data = this.__sources;
      data[source] === undefined ? data[source] = 0 : data[source]--;
      if (data[source]<0) {
        data[source] = 0;
      }
    },


    /**
     * Register an visible image (without increasing the visible number)
     * This is useful to post-load invisible images through the application
     *
     * @type member
     * @param source {String} The incoming (unresolved) URL.
     * @return {void}
     */
    register : function(source)
    {
      var data = this.__sources;

      if (data[source] === undefined) {
        data[source] = 0;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getVisibleImages : function()
    {
      var data = this.__sources;
      var list = {};

      for (var source in data)
      {
        if (data[source] > 0) {
          list[source] = true;
        }
      }

      return list;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getHiddenImages : function()
    {
      var data = this.__sources;
      var list = {};

      for (var source in data)
      {
        if (data[source] < 1) {
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
    this._disposeFields("__sources");
  }
});
