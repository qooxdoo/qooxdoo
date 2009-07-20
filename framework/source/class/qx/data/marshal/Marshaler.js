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
 * EXPERIMENTAL!
 * 
 * Static accessor for all marshaler.
 */
qx.Class.define("qx.data.marshal.Marshaler", 
{
  statics : {
    __jsonMarshaler: null,
    
    /**
     * Creates a qooxdoo object based on the given json data. This function
     * is just a static wrapper. If you want to configure the creation
     * process of the class, use {@link qx.data.marshal.Json} directly.
     * 
     * @param data {Object} The json data.
     */
    jsonToModel : function(data) {
      // singleton for the json marshaler
      if (this.__jsonMarshaler === null) {
        this.__jsonMarshaler = new qx.data.marshal.Json();
      }
      // be sure to create the classes first
      this.__jsonMarshaler.jsonToClass(data);
      // return the model
      return this.__jsonMarshaler.jsonToModel(data);
    }
  }
});