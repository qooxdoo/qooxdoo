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

#id(qx.Mixin)
#module(core)

************************************************************************ */

/*
 * Bootstrapping needed since qx.Class is not yet available
 */
qx.Mixin = {};
qx.Mixin._registry = { "qx.Mixin" : qx.Mixin };

/*
  Example:
  
  qx.Mixin.define("MixinName",
  {
    "includes": [SuperMixins],
    "properties":
    {
      "tabIndex": {type: "number", init: -1}
    },
    "members":
    {
      prop1: 3.141,
      meth1: function() {},
      meth2: function() {}
    }
  });
*/

/**
 * Mixin definition
 * @param vMixinName {String} name of the mixin
 * @param vDefinition {Map,null} definition structure
 * @param vDefinition.includes {List,null} list of mixins to include
 * @param vDefinition.properties {List,null} list of properties with generated setters and getters
 * @param vDefinition.members {Map,null} hash of properties and/or methods
 */
qx.Mixin.define = function(vMixinName, vDefinition)
{

  /*
  ---------------------------------------------------------------------------
    Setting up namespace
  ---------------------------------------------------------------------------
  */

  var vSplitName = vMixinName.split(".");
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
  
  if (typeof vDefinition !== "undefined") {

    /*
     * non-trivial mixin definition
     */
    
    /*
    ---------------------------------------------------------------------------
      Mixins to include
    ---------------------------------------------------------------------------
    */
      
    var vSuper = vDefinition["includes"];

    if (typeof vSuper !== "undefined")
    { 

      if (vSuper instanceof Array)
      {
        var vTotal = vSuper.length;
        
        for (i=0; i<vTotal; i++)
        {
          if (typeof vSuper[i] === "undefined" || !vSuper[i].isMixin) {
            throw new Error("Could not modify mixin " + vMixinName 
              + " due to invalid mixin no. " + (i+1));
          }
          
          for (vProp in vSuper[i]._members) {
            qx._Mixin._members[vProp] = vSuper[i]._members[vProp];
          }
        }
      }
      else 
      {
        throw new Error("Could not modify mixin " + vMixinName 
            + "due to invalid mixin assignment.");
      }
    }
  
    /*
    ---------------------------------------------------------------------------
      Mixin members
    ---------------------------------------------------------------------------
    */
  
    var vMembers = vDefinition["members"];
    
    if (typeof vMembers !== "undefined")
    {
      for( vProp in vMembers)
      {
        qx._Mixin._members[vProp] = vMembers[vProp];
      }
    } 
  }
  
  /*
  ---------------------------------------------------------------------------
    Mixin registration
  ---------------------------------------------------------------------------
  */

  qx.Mixin._registry[vMixinName] = qx._Mixin;
  qx._Mixin.name = vMixinName;
  qx._Mixin.isMixin = true;
};


/**
 * Determine if mixin exists
 * @param vMixinName {String} mixin name to check
 * @return {Boolean} true if mixin exists
 */
qx.Mixin.isAvailable = function(vMixinName) {
  return typeof qx.Mixin._registry[vMixinName] !== "undefined";
};
