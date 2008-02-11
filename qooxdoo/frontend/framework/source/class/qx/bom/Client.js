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

************************************************************************ */

/* ************************************************************************

#require(qx.bom.client.Engine)
#require(qx.bom.client.Feature)
#require(qx.bom.client.Platform)
#require(qx.bom.client.System)

************************************************************************ */

/**
 * A high-level cross-browser wrapper which makes it possible
 * to use queries (even combinations) to engine, feature and platform
 * informations in one nice looking map and compact declaration.
 *
 * This class allows a lot more combinations than possible with the
 * <code>qx.client</code> variant ({@link qx.core.Variant}). However
 * compared to the variants there is no possibity to optimize the
 * code inside the generation of the "build" script. It could be seen
 * as a more flexible competing implementation of the <code>qx.client</code>
 * variant. The developer should decide from case to case which
 * implementation to use. Variants are optimal when the wrapped code is
 * quite large and this way the code which can be saved through the compile
 * time optimization will be also large.
 *
 * Currently supports the following keys:
 *
 * * khtml, opera, webkik, gecko, mshtml, version
 *
 * * standard_mode, quirks_mode
 * * content_box, border_box
 * * svg, canvas, vml
 * * xpath
 *
 * * win, mac, unix
 *
 * * sp1, sp2
 * * win95, win98, winme, winnt4, win2000, winxp, win2003, winvista, wince
 * * linux, sunos, freebsd, netbsd
 * * osx, os9
 * * symbian, psp, nintendods, iphone
 *
 * Types: <code>version</code> is a floating point number. All others
 * are <code>boolean</code>.
 *
 * Combinations: You can combine these keys to full-fledged expressions:
 * <code>,</code> means AND while <code>|</code> means OR. You can also
 * use parenthesis to structure your expression.
 *
 * Valid expressions are for example: <code>gecko</code>, <code>gecko|opera</code>,
 * <code>gecko,version>1.6</code>, <code>opera|(gecko,border_box)</code>
 */
qx.Class.define("qx.bom.Client",
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

        // Check if the keys used in the expression are valid (defined through __keys)
        var lower = this.__lower;
        var reg = /\b([a-z][a-z0-9_]+)\b/g;

        for (var i=1, a=qx.util.StringSplit.split(key, reg), l=a.length; i<l; i+=2)
        {
          if (lower[a[i]] === undefined) {
            throw new Error('The key "' + key + '" contains an invalid property "' + a[i] + '"!');
          }
        }
      }

      // Translate expression to JavaScript
      // Replace all identifiers with the full qualified name
      var code = key.replace(/,/g, "&&").replace(/\|/g, "||").replace(/\b([a-z][a-z0-9_]+)\b/g, "this." + "__active" + ".$1");

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
     * Selects from a map of keys the first which evaluates to <code>true</code>
     * using the {@link #match} method. It works like a long <code>OR</code>
     * expression, the first enabled entry wins.
     *
     * @type static
     * @param map {Map} A map where the key is an expression.
     * @return {var} The map value of the first key which evaluates to <code>true</code>
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

    /**
     * Returns a copy of the current map of active flags and features.
     *
     * @type static
     * @return {Map} The map of active flags
     */
    info : function()
    {
      return qx.lang.Object.copy(this.__active);
    },

    /** Internal map which stores the evaluated value for each already evaluated key */
    __cache : {
      "default" : true  // the default value will always be accepted
    },

    /** Internal data structures with all flags or numeric value which should be available in expressions */
    __keys :
    {
      Engine :
      [
        "OPERA", "WEBKIT", "GECKO", "MSHTML", "VERSION"
      ],

      Feature :
      [
        "STANDARD_MODE", "QUIRKS_MODE",
        "CONTENT_BOX", "BORDER_BOX",
        "SVG", "CANVAS", "VML",
        "XPATH"
      ],

      Platform :
      [
        "WIN", "MAC", "UNIX"
      ],

      System :
      [
        "SP1", "SP2", "WIN95", "WIN98", "WINME", "WINNT4", "WIN2000", "WINXP",
        "WIN2003", "WINVISTA", "WINCE", "LINUX", "SUNOS", "FREEBSD", "NETBSD",
        "OSX", "OS9", "SYMBIAN", "PSP", "NINTENDODS", "IPHONE"
      ]
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
      var ns = qx.bom.client;
      var prop;
      var value;
      var clazz;

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
