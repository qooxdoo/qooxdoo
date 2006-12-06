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

#id(qx.Interface)
#module(core)

************************************************************************ */

/*
 * Bootstrapping needed since qx.Class is not yet available
 */
qx.Interface = {};
qx.Interface._registry = { "qx.Interface" : qx.Interface };

/*
  Example:

  qx.Interface.define("InterfaceName",
  {
    "extends": [SuperInterfaces],
    "members":
    {
      prop1: 3.141,
      meth1: function() {},
      meth2: function() {}
    }
  });
*/

/**
 * Interface definition
 * @param vInterfaceName {String} name of the interface
 * @param vDefinition {Map,null} definition structure
 * @param vDefinition.extends {List,null} list of interfaces to extend from
 * @param vDefinition.members {Map,null} hash of constant properties and/or abstract methods
 */
qx.Interface.define = function(vInterfaceName, vDefinition)
{

  /*
  ---------------------------------------------------------------------------
    Setting up namespace
  ---------------------------------------------------------------------------
  */

  var vSplitName = vInterfaceName.split(".");
  var vNameLength = vSplitName.length;
  var vTempObject = window;

  // Setting up namespace
  for (var i = 0; i<vNameLength; i++)
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

  if (typeof vDefinition !== "undefined") {

    /*
     * non-trivial interface definition
     */

    /*
    ---------------------------------------------------------------------------
      Interfaces to extend from
    ---------------------------------------------------------------------------
    */

    var vSuper = vDefinition["extends"];

    if (typeof vSuper !== "undefined")
    {

      if (vSuper instanceof Array)
      {
        var vTotal = vSuper.length;

        for (i=0; i<vTotal; i++)
        {
          if (typeof vSuper[i] === "undefined" || !vSuper[i].isInterface) {
            throw new Error("Could not extend interface " + vInterfaceName
              + " due to invalid interface no. " + (i+1));
          }

          for (vProp in vSuper[i]._members) {
            qx._Interface._members[vProp] = vSuper[i]._members[vProp];
          }
        }
      }
      else
      {
        throw new Error("Could not extend interface " + vInterfaceName
            + "due to invalid interface assignment.");
      }
    }

    /*
    ---------------------------------------------------------------------------
      Interface members
    ---------------------------------------------------------------------------
    */

    var vMembers = vDefinition["members"];

    if (typeof vMembers !== "undefined")
    {
      for( vProp in vMembers)
      {
        qx._Interface._members[vProp] = vMembers[vProp];
      }
    }
  }

  /*
  ---------------------------------------------------------------------------
    Interface registration
  ---------------------------------------------------------------------------
  */

  qx.Interface._registry[vInterfaceName] = qx._Interface;
  qx._Interface.name = vInterfaceName;
  qx._Interface.isInterface = true;
};


/**
 * Determine if interface exists
 * @param vInterfaceName {String} interface name to check
 * @return {Boolean} true if interface exists
 */
qx.Interface.isAvailable = function(vInterfaceName) {
  return typeof qx.Interface._registry[vInterfaceName] !== "undefined";
};
