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

/* ************************************************************************
#ignore(ITEM)
************************************************************************ */

/**
 * Interactions for widgets implementing {@link qx.ui.core.ISingleSelection}
 */
qx.Class.define("simulator.qxwebdriver.interaction.core.ISingleSelection", {

  statics :
  {
    /**
     * Returns the selectable child widgets
     * {@see qx.ui.core.ISingleSelection#getSelectables}
     * @return {qx.ui.core.Widget[]} Selectable child widgets
     */
    getSelectables : function()
    {
      var widget = qx.core.ObjectRegistry.fromHashCode(this.qxHash);
      var selectables = widget.getSelectables();

      return selectables;
    },

    /**
     * AUT-side function that returns the DOM element of a selectable list item
     * with the given label string or index
     * @return {Element|null} DOM element or <code>null</code> if no matching
     * item can be found
     * @internal
     * @lint ignoreUndefined(ITEM)
     */
    getItemFromSelectables : function()
    {
      var parent = qx.core.ObjectRegistry.fromHashCode('QXHASH');
      var selectables = parent.getSelectables();
      for (var i=0; i<selectables.length; i++) {
        if (selectables[i].getLabel() === ITEM || i === ITEM) {
          return selectables[i].getContentElement().getDomElement();
        }
      }
      return null;
    }
  },

  defer : function(statics)
  {
    simulator.qxwebdriver.Interaction.register("qx.ui.core.ISingleSelection",
      "getSelectables", statics.getSelectables);
  }
});