/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)
#require(qx.Clazz)

************************************************************************ */

qx.Clazz.define("qx.Mixin",
{
  statics :
  {
    /** registers all defined mixins */
    _registry : {},

    /**
     * Mixin definition
     *
     * Example:
     * <pre><code>
     * qx.Mixin.define("fullname",
     * {
     *   "includes": [SuperMixins],
     *   "properties":
     *   {
     *     "tabIndex": {type: "number", init: -1}
     *   },
     *   "members":
     *   {
     *     prop1: 3.141,
     *     meth1: function() {},
     *     meth2: function() {}
     *   }
     * });
     * </code></pre>
     *
     * @type static
     * @name define
     * @access public
     * @param fullname {String} name of the mixin
     * @param definition {Map} definition structure
     * @return {void}
     * @throws TODOC
     */
    define : function(fullname, definition)
    {
      /*
      ---------------------------------------------------------------------------
        Setting up namespace
      ---------------------------------------------------------------------------
      */

      var vSplitName = fullname.split(".");
      var vNameLength = vSplitName.length;
      var vTempObject = window;

      // Setting up namespace
      for (var i=0; i<vNameLength; i++)
      {
        if (typeof vTempObject[vSplitName[i]] === "undefined") {
          vTempObject[vSplitName[i]] = {};
        }

        vTempObject = vTempObject[vSplitName[i]];
      }




      /*
      ---------------------------------------------------------------------------
        Basic data structure
      ---------------------------------------------------------------------------
      */

      qx._Mixin = vTempObject;
      qx._Mixin._members = {};

      var vProp;

      if (typeof definition !== "undefined")
      {
        /*
         * non-trivial mixin definition
         */

        /*
        ---------------------------------------------------------------------------
          Mixins to include
        ---------------------------------------------------------------------------
        */

        var vSuper = definition["includes"];

        if (typeof vSuper !== "undefined")
        {
          if (vSuper instanceof Array)
          {
            var vTotal = vSuper.length;

            for (i=0; i<vTotal; i++)
            {
              if (typeof vSuper[i] === "undefined" || !vSuper[i].isMixin) {
                throw new Error("Could not modify mixin " + fullname + " due to invalid mixin no. " + (i + 1));
              }

              for (vProp in vSuper[i]._members) {
                qx._Mixin._members[vProp] = vSuper[i]._members[vProp];
              }
            }
          }
          else
          {
            throw new Error("Could not modify mixin " + fullname + "due to invalid mixin assignment.");
          }
        }




        /*
        ---------------------------------------------------------------------------
          Mixin members
        ---------------------------------------------------------------------------
        */

        var vMembers = definition["members"];

        if (typeof vMembers !== "undefined")
        {
          for (vProp in vMembers) {
            qx._Mixin._members[vProp] = vMembers[vProp];
          }
        }
      }




      /*
      ---------------------------------------------------------------------------
        Mixin registration
      ---------------------------------------------------------------------------
      */

      qx.Mixin._registry[fullname] = qx._Mixin;
      qx._Mixin.name = fullname;
      qx._Mixin.isMixin = true;
    },

    /**
     * Returns a mixin by name
     *
     * @type static
     * @name byName
     * @access public
     * @param fullname {String} mixin name to check
     * @return {Object | void} mixin object
     */
    byName : function(fullname) {
      return arguments.callee.statics._registry[fullname];
    },

    /**
     * Determine if mixin exists
     *
     * @type static
     * @name isDefined
     * @access public
     * @param fullname {String} mixin name to check
     * @return {Boolean} true if mixin exists
     */
    isDefined : function(fullname) {
      return arguments.callee.statics.byName(fullname) !== undefined;
    }
  }
});
