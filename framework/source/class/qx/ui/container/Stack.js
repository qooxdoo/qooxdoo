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

/**
 * The stack container puts its child widgets on top of each other. Only the
 * topmost widget is visible. This is used e.g. in the tab view widget.
 */
qx.Class.define("qx.ui.container.Stack",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Grow);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether the size of the widget depends on the selected child. When
     * disabled (default) the size is configured to the largest child.
     */
    dynamic :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDynamic"
    },

    /** The selected child */
    selected :
    {
      check : "qx.ui.core.Widget",
      apply : "_applySelected",
      event : "change",
      nullable : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyDynamic : function(value)
    {
      var children = this._getChildren();
      var selected = this.getSelected();
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child != selected)
        {
          if (value) {
            children[i].exclude();
          } else {
            children[i].hide();
          }
        }
      }
    },


    // property apply
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


    /**
     * Adds a new child to the stack
     *
     * @param widget {qx.ui.core.Widget} Any widget
     */
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


    /**
     * Removes the given widget from the stack
     *
     * @param widget {qx.ui.core.Widget} Any widget
     */
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


    /**
     * Detects the position of the given widget in the
     * children list of this widget.
     *
     * @param widget {qx.ui.core.Widget} Any child
     * @return {Integer} The position
     */
    indexOf : function(widget) {
      return this._indexOf(widget);
    },


    /**
     * Returns all children
     *
     * @return {Array} List of all children
     */
    getChildren : function() {
      return this._getChildren();
    },


    /**
     * Go to the previous child in the children list.
     */
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


    /**
     * Go to the next child in the children list.
     */
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
