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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

qx.Class.define("inspector.objects2.Window",
{
  extend : qx.ui.window.Window,

  // name {String}
  // inspectorModel {inspector.components.IInspectorModel}
  construct : function(name, inspectorModel)
  {
    this.base(arguments, name);

    this.setLayout(new qx.ui.layout.Canvas());

    this.setAppearance("objectsWindow");
    this.syncAppearance();

    // apply default size and position
    this.setSizeAndPosition({});

    this.__model = new inspector.objects2.Model(inspectorModel)
    this.__controller = new inspector.objects2.Controller(this.__model);
    this.add(this.__controller.getView(), {edge: 0});
  },

  members :
  {
    __model : null,
    __controller : null,

    // position {Map} with left, top, width, height
    setSizeAndPosition : function(position) {
      var top = position.top ? position.top : 20;
      var left = position.left ? position.left : 20;

      var width = position.width ? position.width : this.getWidth();
      var height = position.height ? position.height : this.getHeight();

      this.moveTo(left, top);
      this.setWidth(width);
      this.setHeight(height);
    }
  },

  destruct : function() {
    this._disposeObjects("__model", "__controller");
  }
});
