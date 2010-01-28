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
/**
 * Samples data container. This class is responsible for getting the smaples 
 * stored in textareas in the index.mhtml file into the JavaScript world.
 */
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


    /**
     * Returns the sample stored with the given name.
     * @param name {String} the name of the sample code.
     * @return {String|Undefined} Returns the sample code, if available.
     */
    get : function(name) {
      var sample = this.__samples[name];
      if (sample) {
        this.__currentName = name;
      }
      return sample;
    },
    
    
    /**
     * Returns an array of all stored sample names.
     * @return {Array} The names of all samples.
     */
    getNames : function() {
      return qx.lang.Object.getKeys(this.__samples);
    },
    
    
    /**
     * Returns the last fetched sample using the {@link #get} method.
     * @return {String} The code of the last used sample.
     */
    getCurrent : function() {
      return this.__samples[this.__currentName];
    },
    
    
    /**
     * Returns the name of the last fetched sample using the {@link #get} method.
     * @return {String} The name of the last used sample of an empty string, if
     *   no sample has been requests to this point.
     */
    getCurrentName : function() {
      return this.__currentName || "";
    },    
    
    
    /**
     * Check if a sample with the given name is available.
     * @param name {String} The name of the sample.
     * @return {Boolean} true, if the sample is available.
     */
    isAvailable : function(name) {
      return this.__samples[name] != undefined;
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function() {
    this.__samples = null;
  }
});
