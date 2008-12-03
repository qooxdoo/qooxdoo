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

    this._addStatic();
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Define static alias from setting, if the custom staticUri setting is set
     * we use it as alias else we take default resourceUri + /static
     *
     * @type member
     * @return {void}
     */
    _addStatic : function ()
    {
      this.add("static", qx.core.Setting.isSet("qx.staticUri") ? qx.core.Setting.get("qx.staticUri") : qx.core.Setting.get("qx.resourceUri") + "/static");
    },


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
        if (value.charAt(0) === "/" || value.charAt(0) === "." || value.indexOf("http://") === 0 || value.indexOf("https://") === 0 || value.indexOf("file://") === 0)
        {
          dynamics[value] = false;
          return value;
        }

        var alias = value.substring(0, value.indexOf("/"));
        var resolved = this._aliases[alias];

        if (resolved !== undefined) {
          var urlPrefix = "";

          /*
           * To avoid a "mixed content" warning in IE when the application is
           * delivered via HTTPS a prefix has to be added. This will transform the
           * relative URL to an absolute one in IE.
           * Though this warning is only displayed in conjunction with images which
           * are referenced as a CSS "background-image", every resource path is
           * changed when the application is served with HTTPS.
           */
          if (qx.core.Variant.isSet("qx.client", "mshtml"))
          {
            if (window.location.protocol === "https:")
            {
              /*
               * SPECIAL CASE
               * It is valid to to begin a URL with "//" so this case has to
               * be considered. If the to resolved URL begins with "//" the
               * manager prefixes it with "https:" to avoid any problems for IE
               */
              if (resolved.match(/^\/\//) != null) {
                urlPrefix = window.location.protocol;
              }
              /*
               * If the resolved URL begins with "./" the final URL has to be
               * put together using the document.URL property.
               * IMPORTANT: this is only applicable for the source version
               */
              else if (resolved.match(/^\.\//) != null && qx.core.Setting.get("qx.isSource"))
              {
                resolved  = "/" + value.substring(0, alias.length);
                urlPrefix = document.URL.substring(0, document.URL.lastIndexOf("/"));
              }
              else
              {
                urlPrefix = window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1);
              }
            }
          }

          dynamics[value] = urlPrefix + resolved + value.substring(alias.length);
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
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_aliases");
  }
});
