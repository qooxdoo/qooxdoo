/* ************************************************************************

  Message Class

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger

************************************************************************ */

/* ************************************************************************

#module(event.message)


************************************************************************ */

/**
 * creates a message to be dispatched on the message bus.
 * still very rudimentary implementation
 */
qx.Class.define("qx.event.message.Message",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vName,vData)
  {
    this.base(arguments);

    this.setName(vName);
    this.setData(vData);
  },







  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    name :
    {
      _fast       : true,
      setOnlyOnce : true
    },

    data :
    {
      _fast : true
    },

    sender :
    {
      _fast       : true,
      setOnlyOnce : true,
      check       : "Object"
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_valueData", "_valueSender");
  }
});
