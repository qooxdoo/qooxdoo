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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class maintains a list of all decorators, which need an update their
 * connected widgets. All decoration changes can then be done at once.
 */
qx.Class.define("qx.ui.core.queue.Decorator",
{
  statics :
  {
    /** {Map} This contains all the queued decorations for the next flush. */
    __queue : {},


    /**
     * Mark a decoration as invalid and add it to the queue.
     *
     * Should only be used by {@link qx.ui.decoration.IDecorator}.
     *
     * @type static
     * @param deco {@link qx.ui.decoration.IDecorator} Decoration to add.
     * @return {void}
     */
    add : function(deco)
    {
      this.__queue[deco.$$hash] = deco;
      qx.ui.core.queue.Manager.scheduleFlush("decorator");
    },


    /**
     * Mark a decoration as valid and remove it from the queue.
     *
     * Should only be used by {@link qx.ui.core.Widget}.
     *
     * @type static
     * @param deco {@link qx.ui.decoration.IDecorator} Decoration to remove.
     * @return {void}
     */
    remove : function(deco) {
      delete this.__queue[deco.$$hash];
    },


    /**
     * Update all connected widgets.
     *
     * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
     *
     * @type static
     * @return {void}
     */
    flush : function()
    {
      var decorationManager = qx.theme.manager.Decoration.getInstance();

      for (var decoHash in this.__queue)
      {
        var deco = this.__queue[decoHash];
        if (deco) {
          decorationManager.updateUsersOf(deco);
        }
      }

      if (deco) {
        this.__queue = {};
      }
    }
  }
});
