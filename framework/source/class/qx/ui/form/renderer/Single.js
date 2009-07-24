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

************************************************************************ */

/**
 * Single column rendere for {@link qx.ui.form.Form}.
 */
qx.Class.define("qx.ui.form.renderer.Single", 
{
  extend : qx.ui.core.Widget,


  construct : function()
  {
    this.base(arguments);
    var layout = new qx.ui.layout.Grid();
    layout.setSpacing(6);
    // TODO set align
    this._setLayout(layout);
  },

  members :
  {
    __row : 0,
    
    addItems : function(items, names, title) {
      // add the header TODO
      
      // add the items
      for (var i = 0; i < items.length; i++) {
        var label = this._createLabel(names[i], items[i]);
        this._add(label, {row: this.__row, column: 0});
        this._add(items[i], {row: this.__row, column: 1});
        this.__row++;
      }
    },
    
    addButton : function(button) {
      // TODO
    },
    
    
    _createLabel : function(name, item) {
      // TODO add * for required
      return new qx.ui.basic.Label(name + " :");
    }
  }
});
