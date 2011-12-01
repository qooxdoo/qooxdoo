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
  extend : qx.core.Object,

  /**
   * @param array {qx.data.Array?} The array to which the objects should be
   *   added.
   */
  construct : function(array)
  {
    this.base(arguments);

    // initialize the model
    if (!array) {
      array = new qx.data.Array()
    }
    this.setModel(array);

    // remove all stored static samples
    for (var i = array.length - 1; i >= 0; i--) {
      var item = array.getItem(i);
      if (item.getCategory() == "static") {
        array.remove(item);
      }
    };

    var textAreas = document.getElementsByTagName("TEXTAREA");

    for (var i = textAreas.length -1; i >= 0; i--)
    {
      if (textAreas[i].className == "qx_samples") {
        var name = textAreas[i].title.split("-")[0];
        var mode = textAreas[i].title.split("-")[1];
        var code = textAreas[i].value;
        var data = {
          name: name,
          code: code,
          mode: mode,
          category: "static"
        };
        array.unshift(qx.data.marshal.Json.createModel(data, true));
      }
    }
  },


  properties : {
    /** Model property to hald the data array. */
    model : {}
  },


  members :
  {
    /**
     * Returns the sample stored with the given name.
     * @param nameandmode {String} the name and mode of the sample code.
     * @return {String|null} Returns the sample code, if available.
     */
    get : function(nameandmode) {
      // split the name and mode into separate parts
      var name = nameandmode.split("-")[0];
      var mode = nameandmode.split("-")[1];
      // get the data
      var model = this.getModel();
      for (var i = 0; i < model.length; i++) {
        var sample = model.getItem(i);
        // check if name AND mode are fitting
        if (sample.getName() == name && sample.getMode() == mode) {
          return sample;
        }
      };
      return null;
    },


    /**
     * Get the first available sample for the given mode.
     * @param mode {String} The mode to look for.
     * @return {Object|null} A sample object.
     */
    getFirstSample : function(mode) {
      var model = this.getModel();
      for (var i = 0; i < model.length; i++) {
        var sample = model.getItem(i);
        if (sample.getMode() == mode) {
          return sample;
        }
      };
      return null;
    },


    /**
     * Check if a sample with the given name and mode is available.
     * @param nameandmode {String} The name and mode of the sample.
     * @return {Boolean} true, if the sample is available.
     */
    isAvailable : function(nameandmode) {
      var name = nameandmode.split("-")[0];
      var mode = nameandmode.split("-")[1];
      var model = this.getModel();
      for (var i = 0; i < model.length; i++) {
        var sample = model.getItem(i);
        if (sample.getName() == name && sample.getMode() == mode) {
          return true;
        }
      };
      return false;
    }
  }
});