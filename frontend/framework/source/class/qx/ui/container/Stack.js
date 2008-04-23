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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.container.Stack",
{
  extend : qx.ui.core.Widget,

  construct : function()
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Grow);
  },

  properties :
  {
    dynamic :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDynamic"
    },

    selected :
    {
      check : "qx.ui.core.Widget",
      apply : "_applySelected",
      event : "change",
      nullable : true
    }
  },

  members :
  {
    _applyDynamic : function(value)
    {
      this.debug("Dynamic: " + value);

    },

    _applySelected : function(value, old)
    {
      if (old)
      {
        if (this.isDynamic()) {
          old.exclude();
        } else {
          old.hide();
        }
      }

      if (value) {
        value.show();
      }
    },

    add : function(widget)
    {
      this._add(widget);

      var selected = this.getSelected();

      if (!selected) {
        this.setSelected(widget);
      }
      else if (selected !== widget)
      {
        if (this.isDynamic()) {
          widget.exclude();
        } else {
          widget.hide();
        }
      }
    },

    remove : function(widget)
    {
      this._remove(widget);

      if (this.getSelected() === widget)
      {
        var first = this._getChildren()[0];
        if (first) {
          this.setSelected(first);
        } else {
          this.resetSelected();
        }
      }
    },

    getChildren : function() {
      return this._getChildren();
    },

    previous : function()
    {
      var selected = this.getSelected();
      var go = this._indexOf(selected)-1;
      var children = this._getChildren();

      if (go < 0) {
        go = children.length - 1;
      }

      var prev = children[go];
      this.setSelected(prev);
    },

    next : function()
    {
      var selected = this.getSelected();
      var go = this._indexOf(selected)+1;
      var children = this._getChildren();

      var next = children[go] || children[0];

      this.setSelected(next);
    }
  }
});
