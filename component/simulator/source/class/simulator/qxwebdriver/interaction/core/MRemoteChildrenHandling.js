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
 * Interaction helpers for widgets that implement {@link qx.ui.core.MRemoteChildrenHandling}
 */
qx.Class.define("simulator.qxwebdriver.interaction.core.MRemoteChildrenHandling", {

  statics :
  {

    /**
     * Returns the values of the 'label' property of each of the widget's children
     * @return {webdriver.promise.Promise} A promise that will be resolved with
     * an Array containing the label strings of the child widgets
     */
    getLabelsFromChildren : function()
    {
      var script = "var labels = []; qx.core.ObjectRegistry.fromHashCode('" + this.qxHash + "')" +
        ".getChildren().forEach(function(item) { labels.push(item.getLabel()) });" +
        "return labels;";
      return this.driver_.executeScript(script)
      .then(function(value) {
        return value;
      });
    },

    /**
     * AUT-side function that returns the DOM element of a selectable list item
     * with the given label string or index
     * @return {Element|null} DOM element or <code>null</code> if no matching
     * item can be found
     * @internal
     * @lint ignoreUndefined(ITEM)
     */
    getItemFromChildren : function()
    {
      var parent = qx.core.ObjectRegistry.fromHashCode('QXHASH');
      var children = parent.getChildren();
      for (var i=0; i<children.length; i++) {
        if (children[i].getLabel() === ITEM || i === ITEM) {
          return children[i].getContentElement().getDomElement();
        }
      }
      return null;
    }
  }
});