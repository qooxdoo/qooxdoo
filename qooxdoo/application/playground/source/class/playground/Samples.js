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
 * Samples data container. This class is responsible for getting the samples
 * stored in textareas in the index.mhtml file into the JavaScript world.
 */
qx.Class.define("playground.Samples",
{
  extend : qx.data.Array,


  construct : function()
  {
    this.base(arguments);

    var textAreas = document.getElementsByTagName("TEXTAREA");

    for (var i=0; i < textAreas.length; i++)
    {
      if (textAreas[i].className == "qx_samples") {
        var name = textAreas[i].title.split("-")[0];
        var mode = textAreas[i].title.split("-")[1];
        var code = textAreas[i].value
        var data = {
          name: name, 
          code: code, 
          mode: mode, 
          category: "static"
        };
        this.push(qx.data.marshal.Json.createModel(data))
      }
    }
  },


  members :
  {
    /**
     * Returns the sample stored with the given name.
     * @param name {String} the name of the sample code.
     * @return {String|Undefined} Returns the sample code, if available.
     */
    get : function(nameandmode) {
      var name = nameandmode.split("-")[0];
      var mode = nameandmode.split("-")[1];
      for (var i = 0; i < this.length; i++) {
        var sample = this.getItem(i);
        if (sample.getName() == name && sample.getMode() == mode) {
          return sample;
        }
      };
      return null;
    },


    /**
     * Get the first available sample for the given mode.
     * @param mode {String} The mode to look for.
     * @return {Object} A sample object.
     */
    getFirstSample : function(mode) {
      for (var i = 0; i < this.length; i++) {
        var sample = this.getItem(i);
        if (sample.getMode() == mode) {
          return sample;
        }
      };
      return null;
    },

    /**
     * Check if a sample with the given name is available.
     * @param name {String} The name of the sample.
     * @return {Boolean} true, if the sample is available.
     */
    isAvailable : function(nameandmode) {
      var name = nameandmode.split("-")[0];
      var mode = nameandmode.split("-")[1];
      for (var i = 0; i < this.length; i++) {
        var sample = this.getItem(i);
        if (sample.getName() == name && sample.getMode() == mode) {
          return true;
        }
      };
      return false;
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
