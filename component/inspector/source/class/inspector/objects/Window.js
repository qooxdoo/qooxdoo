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

/**
 * Objects window which shows all registered qooxdoo objects.
 */
qx.Class.define("inspector.objects.Window",
{
  extend : inspector.components.AbstractWindow,

  /**
   * Construct window.
   *
   * @param name {String} window title.
   * @param inspectorModel {inspector.components.IInspectorModel} model to show.
   */
  construct : function(name, inspectorModel)
  {
    this.base(arguments, name, inspectorModel);

    this.__objectsModel = new inspector.objects.Model(this._model);
    this.__controller = new inspector.objects.Controller(this.__objectsModel);
    this.add(this.__controller.getView(), {edge: 0});
  },

  members :
  {
    /** {inspector.objects.Model} model for the objects view */
    __objectsModel : null,

    /** {inspector.objects.Controller} controller for the view. */
    __controller : null,

    // overridden
    setInitSizeAndPosition : function() {
      var left = parseInt(qx.bom.Viewport.getWidth() - this.getWidth());
      var height = parseInt((qx.bom.Viewport.getHeight() - 30) / 3);
      this.moveTo(left, 30);
      this.setHeight(height);
    }
  },

  destruct : function() {
    this._disposeObjects("__controller", "__objectsModel");
  }
});
