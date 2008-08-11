/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Base class for all unit tests.
 */
qx.Class.define("qx.dev.unit.TestCase",
{
  extend  : qx.core.Object,
  include : [qx.core.MAssert],

  members :
  {
    /**
     * Whether If debugging code is enabled. (i.e. the setting
     * <code>qx.debug</code> has the value <code>on</code>.)
     *
     * @return {Boolean} Whether debugging is enabled
     */
    isDebugOn : function() {
      return qx.core.Variant.isSet("qx.debug", "on") ? true : false;
    }
  }
});
