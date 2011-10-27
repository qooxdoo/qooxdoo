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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("apiviewer.ui.tabview.AbstractPage",
{
  extend : qx.ui.tabview.Page,
  type : "abstract",

  construct : function(classNode)
  {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.Canvas());
    this.setShowCloseButton(true);

    this._bindings = [];

    this._viewer = this._createViewer();
    // while using edge 0, we need to set the padding to 0 as well [BUG #4688]
    this.add(this._viewer, {edge : 0});
    this.setPadding(0);

    this.__bindViewer(this._viewer);

    this.setClassNode(classNode);
  },

  properties :
  {
    classNode :
    {
      apply: "_applyClassNode"
    }
  },

  members :
  {
    _viewer : null,

    _bindings : null,

    _createViewer : function () {
      throw new Error("Abstract method call!");
    },

    _applyClassNode : function(value, old)
    {
      this._viewer.setDocNode(value);

      this.setLabel(value.getFullName());
      this.setIcon(apiviewer.TreeUtil.getIconUrl(value));
      this.setUserData("nodeName", value.getFullName());

      qx.event.Timer.once(function(e) {
        this._viewer.getContentElement().scrollToY(0);
      }, this, 0);
    },

    __bindViewer : function(viewer)
    {
      var uiModel = apiviewer.UiModel.getInstance();
      var bindings = this._bindings;

      bindings.push(uiModel.bind("showInherited", viewer, "showInherited"));
      bindings.push(uiModel.bind("showIncluded", viewer, "showIncluded"));
      bindings.push(uiModel.bind("expandProperties", viewer, "expandProperties"));
      bindings.push(uiModel.bind("showProtected", viewer, "showProtected"));
      bindings.push(uiModel.bind("showPrivate", viewer, "showPrivate"));
      bindings.push(uiModel.bind("showInternal", viewer, "showInternal"));
    },

    __removeBinding : function()
    {
      var uiModel = apiviewer.UiModel.getInstance();
      var bindings = this._bindings;

      while (bindings.length > 0)
      {
        var id = bindings.pop();
        uiModel.removeBinding(id);
      }
    }
  },

  destruct : function()
  {
    this.__removeBinding();
    this._viewer.destroy();
    this._viewer = null;
  }
});
