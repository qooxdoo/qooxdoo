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

/**
 * This singleton manages global resource aliases
 */
qx.Class.define("qx.io.Alias",
{
  type : "singleton",
  extend : qx.util.manager.Value,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Contains defined aliases (like icons/, widgets/, application/, ...)
    this._aliases = {};

    // Define static alias from setting
    this.add("static", qx.core.Setting.get("qx.resourceUri") + "/static");
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * pre process incoming dynamic value
     *
     * @param value {String} incoming value
     * @return {String} pre processed value
     */
    _preprocess : function(value)
    {
      var dynamics = this._dynamic;

      if (dynamics[value] === false)
      {
        return value;
      }
      else if (dynamics[value] === undefined)
      {
        if (value.charAt(0) === "/" || value.charAt(0) === "." || value.indexOf("http://") === 0 || value.indexOf("https://") === "0" || value.indexOf("file://") === 0)
        {
          dynamics[value] = false;
          return value;
        }

        var alias = value.substring(0, value.indexOf("/"));
        var resolved = this._aliases[alias];

        if (resolved !== undefined) {
          dynamics[value] = resolved + value.substring(alias.length);
        }
      }

      return value;
    },


    /**
     * Define an alias to a resource path
     *
     * @type member
     * @param alias {String} alias name for the resource path/url
     * @param base {String} first part of URI for all images which use this alias
     * @return {void}
     */
    add : function(alias, base)
    {
      // Store new alias value
      this._aliases[alias] = base;

      // Localify stores
      var dynamics = this._dynamic;
      var reg = this._registry;
      var entry;

      // Temporary data structure to optimize performance of update
      var paths = {};

      // Update old entries which use this alias
      for (var path in dynamics)
      {
        if (path.substring(0, path.indexOf("/")) === alias)
        {
          dynamics[path] = base + path.substring(alias.length);
          paths[path] = true;
        }
      }

      // Update the corresponding objects (which use this alias)
      for (var key in reg)
      {
        entry = reg[key];
        if (paths[entry.value]) {
          entry.callback.call(entry.object, dynamics[entry.value]);
        }
      }
    },


    /**
     * Remove a previously defined alias
     *
     * @type member
     * @param alias {String} alias name for the resource path/url
     * @return {void}
     */
    remove : function(alias)
    {
      delete this._aliases[alias];

      // No signal for depending objects here. These
      // will informed with the new value using add().
    },


    /**
     * Resolves a given path
     *
     * @type member
     * @param path {String} input path
     * @return {String} resulting path (with interpreted aliases)
     */
    resolve : function(path)
    {
      if (path !== null) {
        path = this._preprocess(path);
      }

      return this._dynamic[path] || path;
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.resourceUri" : "./resource"
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_aliases");
  }
});
