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
 * Abstract base class for all decorators.
 */
qx.Class.define("qx.ui.decoration.Abstract",
{
  type : "abstract",

  extend : qx.core.Object,
  implement : [qx.ui.decoration.IDecorator],

  members :
  {
    _resolveColor : function(value)
    {
    	return qx.theme.manager.Color.getInstance().resolve(value);
    }
  }
});