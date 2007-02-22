/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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

/** Event object for property changes. */
qx.Clazz.define("qx.event.type.DataEvent",
{
  extend : qx.event.type.Event,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vType, vData)
  {
    qx.event.type.Event.call(this, vType);

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
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      this._valueData = null;

      return qx.event.type.Event.prototype.dispose.call(this);
    }
  }
});
