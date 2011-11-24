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

/**
 * This singleton manages global resource aliases.
 *
 * The AliasManager supports simple prefix replacement on strings. There are
 * some pre-defined aliases, and you can register your own with {@link #add}.
 * The AliasManager is automatically invoked in various situations, e.g. when
 * resolving the icon image for a button, so it is common to register aliases for
 * <a href="http://manual.qooxdoo.org/${qxversion}/pages/gui_toolkit/ui_resources.html">resource id's</a>.
 * You can of course call the AliasManager's {@link #resolve}
 * explicitly to get an alias resolution in any situation, but keep that
 * automatic invocation of the AliasManager in mind when defining new aliases as
 * they will be applied globally in many classes, not only your own.
 *
 * Examples:
 * <ul>
 *  <li> <code>foo</code> -> <code>bar/16pt/baz</code>  (resolves e.g. __"foo/a/b/c.png"__ to
 *    __"bar/16pt/baz/a/b/c.png"__)
 *  <li> <code>imgserver</code> -> <code>http&#058;&#047;&#047;imgs03.myserver.com/my/app/</code>
 *    (resolves e.g. __"imgserver/a/b/c.png"__ to
 *    __"http&#058;&#047;&#047;imgs03.myserver.com/my/app/a/b/c.png"__)
 * </ul>
 *
 * For resources, only aliases that resolve to proper resource id's can be __managed__
 * resources, and will be considered __unmanaged__ resources otherwise.
 */
qx.Class.define("qx.util.AliasManager",
{
  type : "singleton",
  extend : qx.util.ValueManager,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Contains defined aliases (like icons/, widgets/, application/, ...)
    this.__aliases = {};

    // Define static alias from setting
    this.add("static", "qx/static");
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __aliases : null,

    /**
     * pre-process incoming dynamic value
     *
     * @param value {String} incoming value
     * @return {String} pre processed value
     */
    _preprocess : function(value)
    {
      var dynamics = this._getDynamic();

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

        if (this.__aliases[value]) {
          return this.__aliases[value];
        }

        var alias = value.substring(0, value.indexOf("/"));
        var resolved = this.__aliases[alias];

        if (resolved !== undefined) {
          dynamics[value] = resolved + value.substring(alias.length);
        }
      }

      return value;
    },


    /**
     * Define an alias to a resource path
     *
     * @param alias {String} alias name for the resource path/url
     * @param base {String} first part of URI for all images which use this alias
     * @return {void}
     */
    add : function(alias, base)
    {
      // Store new alias value
      this.__aliases[alias] = base;

      // Localify stores
      var dynamics = this._getDynamic();

      // Update old entries which use this alias
      for (var path in dynamics)
      {
        if (path.substring(0, path.indexOf("/")) === alias)
        {
          dynamics[path] = base + path.substring(alias.length);
        }
      }
    },


    /**
     * Remove a previously defined alias
     *
     * @param alias {String} alias name for the resource path/url
     * @return {void}
     */
    remove : function(alias)
    {
      delete this.__aliases[alias];

      // No signal for depending objects here. These
      // will informed with the new value using add().
    },


    /**
     * Resolves a given path
     *
     * @param path {String} input path
     * @return {String} resulting path (with interpreted aliases)
     */
    resolve : function(path)
    {
      var dynamic = this._getDynamic();

      if (path != null) {
        path = this._preprocess(path);
      }

      return dynamic[path] || path;
    },


    /**
     * Get registered aliases
     *
     * @return {Map} the map of the currently registered alias:resolution pairs
     */
    getAliases : function()
    {
      var res = {};
      for (var key in this.__aliases) {
        res[key] = this.__aliases[key];
      }
      return res;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__aliases = null;
  }
});
