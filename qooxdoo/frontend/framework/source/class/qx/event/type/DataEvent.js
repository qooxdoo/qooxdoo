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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/** Event object for data transfers. */
qx.Class.define("qx.event.type.DataEvent",
{
  extend : qx.event.type.Event,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

 /**
  * @param vType {String} the type name of the event
  * @param vData {var} additional data which should be passed to the event listener
  */
  construct : function(vType, vData)
  {
    this.base(arguments, vType);

    this.setData(vData);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    propagationStopped :
    {
      _fast        : true,
      defaultValue : false
    },

    data : { _fast : true }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_valueData");
  }
});
