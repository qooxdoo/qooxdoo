/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.util.LayoutApplication",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var frame = new qx.ui.container.Composite(new qx.ui.layout.Dock());

      var root = new qx.ui.container.Composite(new qx.ui.layout.Canvas()).set({
        minHeight: 10,
        minWidth: 10
      });

      var editor = new demobrowser.demo.util.PropertyEditor(root);
      root.addListener("tap", this._onTapRoot, this);

      frame.add(editor, {edge: "east"});
      frame.add(root);

      this._root = root;
      this._editor = editor;

      qx.application.Standalone.prototype.getRoot.call(this).add(frame, {edge:0});
    },


    getRoot : function() {
      return this._root;
    },


    _onTapRoot : function(e)
    {
      if (e.getTarget() !== this._root) {
        this._editor.handleWidgetTap(e);
      }
    }
  },


  destruct : function() {
    this._root = this._editor = null;
  }
});