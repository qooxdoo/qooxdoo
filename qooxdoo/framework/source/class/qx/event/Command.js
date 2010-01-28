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
 * This class is just for deprecation. So please use {@link qx.ui.core.Command}
 * instead.
 * @deprecated for 0.9
 */
qx.Class.define("qx.event.Command",
{
  extend : qx.ui.core.Command,

  /**
   * Create a new instance of Command
   *
   * @param shortcut {String} shortcuts can be composed of optional modifier
   *    keys Control, Alt, Shift, Meta and a non modifier key.
   *    If no non modifier key is specified, the second paramater is evaluated.
   *    The key must be separated by a <code>+</code> or <code>-</code> character.
   *    Examples: Alt+F1, Control+C, Control+Alt+Delete
   */
  construct : function(shortcut)
  {
    this.base(arguments, shortcut);
    qx.log.Logger.deprecatedMethodWarning(
      arguments.callee,
      "Please use qx.ui.core.Command instead."
    );
  },

  members :
  {
    /**
     * Checks whether the given key event matches the command's shortcut
     *
     * @deprecated for 0.9
     * @param e {qx.event.type.KeySequence} the key event object
     * @return {Boolean} whether the commands shortcut matches the key event
     */
    matchesKeyEvent : function(e)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "This message will be made private."
      );
      return this._shortcut.matchesKeyEvent(e);
    }
  }
});
