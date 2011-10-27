/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class represents the widget finder window.
 *
 * The widget finder offers a insight into the hierarchical structure
 * of the current document. Therefore a tree shows all widgets added to
 * the document, which is the root element in a qooxdoo GUI.
 */
qx.Class.define("inspector.widgets.WidgetsWindow", {

  extend : inspector.components.AbstractWindow,


  /**
   * Creates a new instance of a WidgetsWindow.
   *
   * @param name {String} The window title.
   * @param inspectorModel {inspector.components.IInspectorModel} model to show.
   */
  construct : function(name, inspectorModel)
  {
    this.base(arguments, name, inspectorModel);

    this.__view = new inspector.widgets.View(this._model);
    this.add(this.__view, {edge: 0});

    this.__changeApplicationListenerID = this._model.addListener("changeApplication", function(e) {
      this.load();
    }, this);

    this.__changeInspectedListenerID = this._model.addListener("changeInspected", function(e) {
      this.select(e.getData());
    }, this);
  },

  members :
  {
    __view : null,

    __changeApplicationListenerID : null,

    __changeInspectedListenerID : null,

    setInitSizeAndPosition: function() {
      var left = qx.bom.Viewport.getWidth() - this.getWidth();
      var height = parseInt((qx.bom.Viewport.getHeight() - 30) / 3);
      this.moveTo(left, 30 + height);
      this.setHeight(height);
    },

    select: function(widget) {
      this.__view.select(widget);
    },

    load: function(win) {
      this.__view.load(win);
    }
  },

  destruct : function()
  {
    this._model.removeListenerById(this.__changeApplicationListenerID);
    this._model.removeListenerById(this.__changeInspectedListenerID);
    this.__view.dispose();
    this.__view = null;
  }
});
