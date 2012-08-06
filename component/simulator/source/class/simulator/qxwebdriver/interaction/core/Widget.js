/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Interactions for widgets extending {@link qx.ui.core.Widget}
 */
qx.Class.define("simulator.qxwebdriver.interaction.core.Widget", {

  statics :
  {
    /**
     * AUT-side function that returns the DOM element of the specified child control
     * @return {Element} The child control's DOM element
     * @internal
     */
    getChildControl : function()
    {
      var parent = qx.core.ObjectRegistry.fromHashCode('QXHASH');
      return parent.getChildControl('CHILDCONTROL').getContentElement().getDomElement();
    }
  }
});
