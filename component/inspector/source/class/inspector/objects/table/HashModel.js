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
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Generates the model for the hash view. It creates a table model which
 * contains the hash value and the classname of each registered qooxdoo object.
 *
 * <pre>
 * ----------------------------
 * | Hash | Classname         |
 * ----------------------------
 * | 0    | qx.core.Object    |
 * ----------------------------
 * | 1    | qx.ui.form.Button |
 * ----------------------------
 * | ...  | ...               |
 * ----------------------------
 * </pre>
 */
qx.Class.define("inspector.objects.table.HashModel",
{
  extend : inspector.objects.table.AbstractModel,

  /**
   * Constructs hash model.
   *
   * @param model {inspector.objects.Model} model to show.
   */
  construct : function(model)
  {
    this.base(arguments, model, ["Hash", "Classname"]);

    // set the sorting method for the hash values
    this.setSortMethods(0,
    {
      ascending : function(a, b) {
        return parseInt(a) - parseInt(b);
      },
      descending : function(a, b) {
        return parseInt(b) - parseInt(a);
      }
    });
  },

  members :
  {
    // overridden
    _getData : function()
    {
      var objects = this._model.getObjects();
      var data = [];
      for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        data.push([object.toHashCode(), object.classname]);
      }

      return data;
    }
  }
});
