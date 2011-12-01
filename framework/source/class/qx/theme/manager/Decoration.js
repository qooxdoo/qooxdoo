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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Manager for decoration themes
 */
qx.Class.define("qx.theme.manager.Decoration",
{
  type : "singleton",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Selected decoration theme */
    theme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyTheme",
      event : "changeTheme"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __dynamic : null,

    /**
     * Returns the dynamically interpreted result for the incoming value
     *
     * @param value {String} dynamically interpreted idenfier
     * @return {var} return the (translated) result of the incoming value
     */
    resolve : function(value)
    {
      if (!value) {
        return null;
      }

      if (typeof value === "object") {
        return value;
      }

      var theme = this.getTheme();
      if (!theme) {
        return null;
      }

      var cache = this.__dynamic;
      if (!cache) {
        cache = this.__dynamic = {};
      }

      var resolved = cache[value];
      if (resolved) {
        return resolved;
      }

      var entry = theme.decorations[value];
      if (!entry) {
        return null;
      }

      // create empty style map if necessary
      if (!entry.style) {
        entry.style = {};
      }

      // check for inheritance
      var currentEntry = entry;
      while (currentEntry.include) {
        currentEntry = theme.decorations[currentEntry.include];
        // decoration key
        if (!entry.decorator && currentEntry.decorator) {
          entry.decorator = currentEntry.decorator;
        }

        // styles key
        if (currentEntry.style) {
          for (var key in currentEntry.style) {
            if (entry.style[key] == undefined) {
              entry.style[key] = currentEntry.style[key];
            }
          }
        }
      }

      var clazz = entry.decorator;
      if (clazz == null) {
        throw new Error(
          "Missing definition of which decorator to use in entry: "
           + value + "!"
        );
      }

      // check if an array is given and the decorator should be build on runtime
      if (clazz instanceof Array) {
        var names = clazz.concat([]);
        for (var i=0; i < names.length; i++) {
          names[i] = names[i].basename.replace(".", "");
        };
        var name = "qx.ui.decoration." + names.join("_");
        if (!qx.Class.getByName(name)) {
          qx.Class.define(name, {
            extend : qx.ui.decoration.DynamicDecorator,
            include : clazz
          });
        }
        clazz = qx.Class.getByName(name);
      }

      return cache[value] = (new clazz).set(entry.style);
    },


    /**
     * Whether the given value is valid for being used in a property
     * with the 'check' configured to 'Decorator'.
     *
     * @param value {var} Incoming value
     * @return {Boolean} Whether the value is valid for being used in a Decorator property
     */
    isValidPropertyValue : function(value)
    {
      if (typeof value === "string") {
        return this.isDynamic(value);
      }
      else if (typeof value === "object")
      {
        var clazz = value.constructor;
        return qx.Class.hasInterface(clazz, qx.ui.decoration.IDecorator);
      }

      return false;
    },


    /**
     * Whether a value is interpreted dynamically
     *
     * @param value {String} dynamically interpreted idenfier
     * @return {Boolean} returns true if the value is interpreted dynamically
     */
    isDynamic : function(value)
    {
      if (!value) {
        return false;
      }

      var theme = this.getTheme();
      if (!theme) {
        return false;
      }

      return !!theme.decorations[value];
    },


    /**
     * Whether the given decorator is cached
     *
     * @param decorator {qx.ui.decoration.IDecorator} The decorator to check
     * @return {Boolean} <code>true</code> if the decorator is cached
     * @internal
     */
    isCached : function(decorator)
    {
      return !this.__dynamic ? false :
        qx.lang.Object.contains(this.__dynamic, decorator);
    },


    // property apply
    _applyTheme : function(value, old)
    {
      var aliasManager = qx.util.AliasManager.getInstance();

      if (old)
      {
        for (var alias in old.aliases) {
          aliasManager.remove(alias);
        }
      }

      if (value)
      {
        for (var alias in value.aliases) {
          aliasManager.add(alias, value.aliases[alias]);
        }
      }

      if (!value) {
        this.__dynamic = {};
      }
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeMap("__dynamic");
  }
});
