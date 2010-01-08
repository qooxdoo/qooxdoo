/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("playground.Samples", 
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);
    
    this.__samples = {};
    
    var textAreas = document.getElementsByTagName("TEXTAREA");

    for (var i=0; i < textAreas.length; i++)
    {
      if (textAreas[i].className == "qx_samples") {
        this.__samples[textAreas[i].title] = textAreas[i].value;
      }
    }    
  },

  members :
  {
    __samples : null,
    __currentName : null,

    get : function(name) {
      var sample = this.__samples[name];
      if (sample) {
        this.__currentName = name;
      }
      return sample;
    },
    
    
    getNames : function() {
      return qx.lang.Object.getKeys(this.__samples);
    },
    
    
    getCurrent : function() {
      return this.__samples[this.__currentName];
    },
    
    
    getCurrentName : function() {
      return this.__currentName || "";
    },    
    
    
    isAvailable : function(name) {
      return this.__samples[name] != undefined;
    }
  }
});
