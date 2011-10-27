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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("inspector.console.ConsoleWindow",
{
  extend : inspector.components.AbstractWindow,

  /**
   * Creates a new instance of a ConsoleWindow.
   *
   * @param name {String} The window title.
   * @param inspectorModel {inspector.components.IInspectorModel} model to show.
   */
  construct : function(name, inspectorModel)
  {
    this.base(arguments, name, inspectorModel);

    this.__view = new inspector.console.View(this._model);
    this.add(this.__view, {edge: 0});
  },

  members :
  {
    __view : null,

    setInitSizeAndPosition: function() {
      var width = qx.bom.Viewport.getWidth() - 300;
      var height = parseInt((qx.bom.Viewport.getHeight() - 30) / 3);
      this.moveTo(0, 2 * height + 30);
      this.setWidth(width);
      this.setHeight(height);
    },

    inspectObjectByInternalId: function(id) {
      this.__view.inspectObjectByInternalId(id);
    },


    inspectObjectByDomSelecet: function(index, key) {
      this.__view.inspectObjectByDomSelecet(index, key);
    },

    inspectObject: function(inputObject) {
      this.__view.inspectObject(inputObject);
    },

    goToDefaultView: function() {
      this.__view.goToDefaultView();
    }
  },

  destruct : function()
  {
    this.__view.dispose();
    this.__view = null;
  }
});
