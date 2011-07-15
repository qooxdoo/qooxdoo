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

qx.Class.define("qx.test.ui.list.AbstractListTest",
{
  type : "abstract",
  extend : qx.test.ui.LayoutTestCase,
  include : [qx.test.ui.list.MAssert],

  members :
  {
    _model : null,

    _list : null,


    setUp : function()
    {
      this.base(arguments);

      this._model = this.createModelData();
      this._list = new qx.ui.list.List(this._model);

      this.configureList();

      this.getRoot().add(this._list);

      this.flush();
    },


    tearDown : function()
    {
      this.base(arguments);

      this._list.dispose();
      this._list = null;
      this._model.dispose();
      this._model = null;
    },


    createModelData : function() {
      throw new Error("Abstract 'createModelData' method call!");
    },


    configureList : function() {}
  }
});
