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

************************************************************************ */

qx.Clazz.define("qx.Interface",
{
  statics :
  {
    /** registers all defined interfaces */
    _registry : {},

    /**
     * Interface definition
     * 
     * Example:
     * <pre><code>
     * qx.Interface.define("fullname",
     * {
     * "extends": [SuperInterfaces],
     * "members":
     * {
     * prop1: 3.141,
     * meth1: function() {},
     * meth2: function() {}
     * }
     * });
     * </code></pre>
     *
     * @type static
     * @name define
     * @access public
     * @param fullname {String} name of the interface
     * @param definition {Map,null} definition structure
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

      qx._Interface = vTempObject;
      qx._Interface._members = {};

      var vProp;

      if (typeof definition !== "undefined")
      {
        /*
         * non-trivial interface definition
         */

        /*
        ---------------------------------------------------------------------------
          Interfaces to extend from
        ---------------------------------------------------------------------------
        */

        var vSuper = definition["extends"];

        if (typeof vSuper !== "undefined")
        {
          if (vSuper instanceof Array)
          {
            var vTotal = vSuper.length;

            for (i=0; i<vTotal; i++)
            {
              if (typeof vSuper[i] === "undefined" || !vSuper[i].isInterface) {
                throw new Error("Could not extend interface " + fullname + " due to invalid interface no. " + (i + 1));
              }

              for (vProp in vSuper[i]._members) {
                qx._Interface._members[vProp] = vSuper[i]._members[vProp];
              }
            }
          }
          else
          {
            throw new Error("Could not extend interface " + fullname + "due to invalid interface assignment.");
          }
        }




        /*
        ---------------------------------------------------------------------------
          Interface members
        ---------------------------------------------------------------------------
        */

        var vMembers = definition["members"];

        if (typeof vMembers !== "undefined")
        {
          for (vProp in vMembers) {
            qx._Interface._members[vProp] = vMembers[vProp];
          }
        }
      }




      /*
      ---------------------------------------------------------------------------
        Interface registration
      ---------------------------------------------------------------------------
      */

      qx.Interface._registry[fullname] = qx._Interface;
      qx._Interface.name = fullname;
      qx._Interface.isInterface = true;
    },

    /**
     * Returns a interface by name
     *
     * @type static
     * @name byName
     * @access public
     * @param fullname {String} interface name to check
     * @return {Object | void} interface object
     */
    byName : function(fullname) {
      return arguments.callee.statics._registry[fullname];
    },

    /**
     * Determine if interface exists
     *
     * @type static
     * @name isDefined
     * @access public
     * @param fullname {String} interface name to check
     * @return {Boolean} true if interface exists
     */
    isDefined : function(fullname) {
      return arguments.callee.statics.byName(fullname) !== undefined;
    }
  }
});
