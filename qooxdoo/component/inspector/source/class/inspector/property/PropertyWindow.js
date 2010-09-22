/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Tango/22/actions/view-refresh.png)

************************************************************************ */

qx.Class.define("inspector.property.PropertyWindow",
{
  extend : inspector.components.AbstractWindow,

  /**
   * Creates a new instance of a PropertyWindow.
   *
   * @param name {String} The window title.
   * @param inspectorModel {inspector.components.IInspectorModel} model to show.
   */
  construct : function(name, inspectorModel)
  {
    this.base(arguments, name, inspectorModel);

    this.__view = new inspector.property.View();
    this.add(this.__view, {edge: 0});

    this.__changeInspectedListenerID = this._model.addListener("changeInspected", function(e) {
      this.select(e.getData());
    }, this);
  },

  members :
  {
    __view : null,

    __changeInspectedListenerID : null,

    setInitSizeAndPosition : function()
    {
      var left = qx.bom.Viewport.getWidth() - this.getWidth();
      var height = parseInt((qx.bom.Viewport.getHeight() - 30) / 3);
      this.moveTo(left, 30 + 2 * height);
      this.setHeight(height);
    },

    select: function(widget) {
      this.__view.select(widget);
    }
  },

  destruct : function()
  {
    this._model.removeListenerById(this.__changeInspectedListenerID);
    this.__view.dispose();
    this.__view = null;
  }
});
