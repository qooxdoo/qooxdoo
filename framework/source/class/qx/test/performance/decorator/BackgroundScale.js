/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
qx.Class.define("qx.test.performance.decorator.BackgroundScale",
{
  extend : qx.test.performance.decorator.AbstractDecorator,

  members :
  {
    createDecorator : function() {
      return new qx.ui.decoration.Background().set({
        backgroundImage  : "decoration/selection.png",
        backgroundRepeat : "scale"
      });
    }
  }
});
