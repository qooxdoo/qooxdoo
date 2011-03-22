/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * The small folder open/close button.
 *
 * @deprecated Since 1.4 Please use 'qx.ui.tree.core.FolderOpenButton' instead.
 */
qx.Class.define("qx.ui.tree.FolderOpenButton",
{
  extend : qx.ui.tree.core.FolderOpenButton,

  construct : function()
  {
    this.base(arguments);

    qx.log.Logger.deprecatedClassWarning(this.constructor, "The class" +
      " 'qx.ui.tree.FolderOpenButton' is deprecated please use " +
      "'qx.ui.tree.core.FolderOpenButton' instead."
    );
  }
});
