/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
qx.Class.define("qx.test.performance.decorator.Single",
{
  extend : qx.test.performance.decorator.AbstractDecorator,

  members :
  {
    createDecorator : function() {
      return new qx.ui.decoration.Decorator(5, "solid", "red");
    }
  }
});
