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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Every object, which whishes to establish a connection to a dynamic value
 * using the value manager must implement the method <code>hasConnectionTo</code>.
 *
 * This mixin provides an implementation for this method and automatically
 * takes care of disconnecting all connections to value managers on object
 * dispose.
 */
qx.Mixin.define("qx.util.manager.MConnectedObject",
{
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method is used by value managers {@link qx.util.manager.Value} to
     * notify the object that a connection to a dynamic value has been
     * established.
     *
     * @param valueManager {qx.util.manager.Value} Value manager, which is connected
     *     to this object.
     */
    hasConnectionTo : function(valueManager)
    {
      if (!this._valueManager) {
        this._valueManager = {};
      }
      this._valueManager[valueManager.toHashCode()] = valueManager;
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    for (var key in this._valueManager)
    {
      var valueManager = this._valueManager[key];
      valueManager.disconnect(this);
    }

    this._disposeFields("_valueManager");
  }
});