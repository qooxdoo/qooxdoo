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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("demobrowser.demo.data.model.Node", 
{
  extend : qx.core.Object,

  properties : {
    child : {
      check : "demobrowser.demo.data.model.Node",
      event : "changeChild",
      nullable : true
    },
    
    names : {
      check : "qx.data.Array",
      event : "changeNames",
      init : new qx.data.Array("Homer", "Marge")
    },
    
    number : {
      init:  10,
      validate: "__validateNumber"
    }
  },
  
  members: {
    __validateNumber: function(value) {
      // check if its a number
      if(!isNaN(parseFloat(value))) {
        return;
      } 
      throw new qx.core.ValidationError("Validation Error: " + value
        + "is no number (parseFloat says so!).");        
    }
  }
  
});
