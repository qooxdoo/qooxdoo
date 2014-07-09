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
 * Commands can be used to globally define keyboard shortcuts. They could
 * also be used to assign an execution of a command sequence to multiple
 * widgets. It is possible to use the same Command in a MenuButton and
 * ToolBarButton for example.
 *
 * @deprecated {4.1} Please use qx.ui.command.Command instead.
 */
qx.Class.define("qx.ui.core.Command",
{
  extend : qx.ui.command.Command,


  // overridden
  construct : function(shortcut)
  {
    qx.log.Logger.deprecatedMethodWarning (
      arguments.callee, "Please use qx.ui.command.Command instead."
    );
    this.base(arguments, shortcut);
  }
});
