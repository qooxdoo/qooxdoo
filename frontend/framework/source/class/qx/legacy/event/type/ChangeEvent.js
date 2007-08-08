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
qx.Class.define("qx.event.type.ChangeEvent",
{
  extend : qx.event.type.Event,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

 /**
  * @param type {String} the type name of the event
  * @param value {var} additional value which should be passed to the event listener
  * @param value {var} additional old value which should be passed to the event listener
  */
  construct : function(type, value, old)
  {
    this.base(arguments, type);

    this.setValue(value);
    this.setOldValue(old);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    value : { _fast : true },
    oldValue : { _fast : true }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the event data
     *
     * @deprecated use {@link #getValue} instead
     */
    getData : function() {
      return this.getValue();
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_valueValue", "_valueOldValue");
  }
});
