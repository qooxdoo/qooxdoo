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

************************************************************************ */

/* ************************************************************************

#module(client)
#require(qx.html2.client.Engine)
#require(qx.html2.client.Features)
#require(qx.html2.client.Platform)

************************************************************************ */

qx.Class.define("qx.html2.Client",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Whether the given key evaluates to <code>true</code>
     *
     * @type static
     * @param key {String} A valid expression
     * @return {Boolean} The evaluated value of the given key
     * @throws an error if the key could not be parsed or evaluated
     */
    match : function(key)
    {
      var cache = this.__cache;

      if (cache[key] !== undefined) {
        return cache[key];
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // Accept lowercase letter, numbers, underlines, pipes, commas, equal sign, dots and parenthesis
        // To evaluate the expression pipes and commas are translated to their JS equivalents later.
        if (/^[a-z0-9_\(\),\|<>=\.\!]+$/.exec(key) == null) {
          throw new Error("Could not parse key: " + key);
        }

        // Webkit does not correctly implements the split() command used beyond
        if (qx.core.Variant.isSet("qx.client", "webkit")) {}
        else
        {
          // Check if the keys used in the expression are valid (defined through __keys)
          var lower = this.__lower;
          
          for (var i=1, a=key.split(/\b([a-z][a-z0-9_]+)\b/g), l=a.length; i<l; i+=2)
          {
            if (lower[a[i]] === undefined) {
              throw new Error('The key "' + key + '" contains an invalid property "' + a[i] + '"!');
            }
          }
        }
      }

      // Translate expression to JavaScript
      // Replace all identifiers with the full qualified name
      var code = key.replace(/,/g, "&&").replace(/\|/g, "||").replace(/\b([a-z][a-z0-9_]+)\b/g, "this.__active.$1");

      // In debug mode we evaluate inside a try-catch block to detect script errors
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        try
        {
          if (cache[key] = !!eval(code)) {
            return true;
          }
        }
        catch(ex)
        {
          throw new Error('Could not evaluate key: "' + key + '" (' + code + ')');
        }
      }
      else
      {
        if (cache[key] = !!eval(code)) {
          return true;
        }
      }

      return false;
    },


    /**
     * Selects from a map of keys the first which evaluates to <code>true</code>. It works
     * like a long <code>OR</code> expression, the first enabled entry wins.
     *
     * @type static
     * @param map {Map} A map where the key is an expression.
     * @return {var} The first key which evaluates to <code>true</code>
     * @throws an exception if none of the given keys evaluates to <code>true</code>
     */
    select : function(map)
    {
      for (var key in map)
      {
        if (this.match(key)) {
          return map[key];
        }
      }

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        throw new Error('No match for selection in map [' + qx.lang.Object.getKeysAsString(map) + '] found, and no default ("default") given');
      }
    },

    /** Internal map which stores the evaluated value for each already evaluated key */
    __cache : { "default" : true  // the default value will always be accepted
    },

    /** Internal data structures with all flags or numeric value which should be available in expressions */
    __keys :
    {
      Engine : [ "KHTML", "OPERA", "OPERA8", "OPERA85", "OPERA9", "OPERA95", "WEBKIT", "WEBKIT419", "WEBKIT420", "GECKO", "GECKO17", "GECKO18", "GECKO181", "GECKO19", "MSHTML", "MSHTML6", "MSHTML7", "VERSION" ],

      Features : [ "STANDARD_MODE", "QUIRKS_MODE", "CONTENT_BOX", "BORDER_BOX", "SVG", "CANVAS", "VML", "XPATH" ],

      Platform : [ "WIN", "MAC", "UNIX" ]
    },

    /** Internal data strucure which contains all enabled flags and numeric values of the __keys structure */
    __active : {},

    /** Internal data structure to have a flagable map of all properties in __keys */
    __lower : {},


    /**
     * Automatically fills the __active map from the information of the __keys map
     *
     * @type static
     * @return {void}
     * @throws TODOC
     */
    __init : function()
    {
      var keys = this.__keys;
      var lower = this.__lower;
      var ns = qx.html2.client;
      var prop;
      var value;

      // "main" is the name of the Class
      for (var main in keys)
      {
        // Cache current class
        clazz = ns[main];

        // Generate lower case equivalent map. Used to validate keys used
        // in expression at user side
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          for (var i=0, a=keys[main], l=a.length; i<l; i++)
          {
            prop = a[i].toLowerCase();

            if (lower[prop] !== undefined) {
              throw new Error("Double definition of property: " + prop);
            }

            this.__lower[prop] = true;
          }
        }

        // Interate through all constants defined for this class (@see __keys)
        for (var i=0, a=keys[main], l=a.length; i<l; i++)
        {
          prop = a[i];
          value = clazz[prop];

          // Some additional check in debug version
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (value === undefined) {
              throw new Error("Unknown property: " + prop);
            }

            if (!(typeof value === "boolean" || typeof value === "number")) {
              throw new Error("Invalid value in property: " + prop + "! Must be boolean or number!");
            }
          }

          // Only store "true" or numeric values (ignore falsy)
          if (value !== false) {
            this.__active[prop.toLowerCase()] = value;
          }
        }
      }
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
