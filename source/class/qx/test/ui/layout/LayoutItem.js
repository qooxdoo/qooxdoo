/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.layout.LayoutItem",
{
  extend : qx.ui.core.LayoutItem,

  construct : function(width, height)
  {
    this.base(arguments);

    if (width !== undefined) {
      this.setWidth(width);
    }

    if (height !== undefined) {
      this.setHeight(height);
    }

    this.bounds = {};
  },


  properties :
  {
    visibility :
    {
      check : ["visible", "hidden", "excluded"],
      init : "visible",
      apply : "_applyVisibility",
      event : "changeVisibility"
    }
  },

  members :
  {
    bounds : null,

    __layout : null,
    __children : null,

    renderLayout : function(left, top, width, height)
    {
      var changes = this.base(arguments, left, top, width, height);

      if (!changes) {
        return;
      }

      this.bounds = {
        left: left,
        top: top,
        width: width,
        height: height
      };

      if (changes.size || changes.local || changes.margin)
      {
        if (this.__layout && this.getLayoutChildren().length > 0) {
          this.__layout.renderLayout(width, height, {top: 0, right: 0, bottom: 0, left: 0});
        }
      }

      return changes;
    },


    setLayout : function(layout)
    {
      layout.connectToWidget(this);
      qx.ui.core.queue.Layout.add(this);
      this.__layout = layout;
    },


    _getLayout : function() {
      return this.__layout;
    },


    // overridden
    invalidateLayoutCache : function()
    {
      this.base(arguments);

      if (this.__layout) {
        this.__layout.invalidateLayoutCache();
      }
    },


    invalidateLayoutChildren : function()
    {
      var layout = this.__layout;
      if (layout) {
        layout.invalidateChildrenCache();
      }

      qx.ui.core.queue.Layout.add(this);
    },


    // property apply
    _applyVisibility : function(value, old)
    {
      // only force a layout update if visibility change from/to "exclude"
      var parent = this.$$parent;
      if (parent && (old == null || value == null || old === "excluded" || value === "excluded")) {
        parent.invalidateLayoutChildren();
      }

      // Update visibility cache
      qx.ui.core.queue.Visibility.add(this);
    },


    _getContentHint : function()
    {
      if (this.__layout && this.getLayoutChildren().length > 0) {
        return this.__layout.getSizeHint();
      } else {
        return { width: 0, height: 0};
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      // Start with the user defined values
      var width = this.getWidth();
      var minWidth = this.getMinWidth();
      var maxWidth = this.getMaxWidth();

      var height = this.getHeight();
      var minHeight = this.getMinHeight();
      var maxHeight = this.getMaxHeight();


      // Ask content
      var contentHint = this._getContentHint();

      if (width == null) {
        width = contentHint.width;
      }

      if (height == null) {
        height = contentHint.height;
      }

      if (minWidth == null)
      {
        if (contentHint.minWidth != null) {
          minWidth = contentHint.minWidth;
        }
      }

      if (minHeight == null)
      {
        if (contentHint.minHeight != null) {
          minHeight = contentHint.minHeight;
        }
      }

      if (maxWidth == null)
      {
        if (contentHint.maxWidth == null) {
          maxWidth = Infinity;
        } else {
          maxWidth = contentHint.maxWidth;
        }
      }

      if (maxHeight == null)
      {
        if (contentHint.maxHeight == null) {
          maxHeight = Infinity;
        } else {
          maxHeight = contentHint.maxHeight;
        }
      }

      return {
        width : width,
        minWidth : minWidth,
        maxWidth : maxWidth,
        height : height,
        minHeight : minHeight,
        maxHeight : maxHeight
      };
    },


    add : function(child, options)
    {
      if (!this.__children) {
        this.__children = [];
      }
      this.__children.push(child);
      this.__layout.invalidateChildrenCache();

      if (options) {
        child.setLayoutProperties(options);
      } else {
        this.updateLayoutProperties();
      }

      child.setLayoutParent(this);
      qx.ui.core.queue.Layout.add(this);
    },


    remove : function(child)
    {
      if (!this.__children) {
        this.__children = [];
      }

      qx.lang.Array.remove(this.__children, child);

      // Clear parent connection
      child.setLayoutParent(null);

      // clear the layout's children cache
      if (this.__layout) {
        this.__layout.invalidateChildrenCache();
      }

      // Add to layout queue
      qx.ui.core.queue.Layout.add(this);
    },


    getLayoutChildren : function()
    {
      var children = this.__children || [];
      var layoutChildren = [];

      for (var i=0; i<children.length; i++)
      {
        var child = children[i];
        if (child.getVisibility() !== "excluded") {
          layoutChildren.push(child);
        }
      }
      return layoutChildren;
    },


    checkAppearanceNeeds : function() {},


    // copied from qx.ui.core.Widget
    addChildrenToQueue : function(queue)
    {
      var children = this.__children;
      if (!children) {
        return;
      }

      var child;
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        queue.push(child);

        child.addChildrenToQueue(queue);
      }
    }
  },

  destruct : function() {
    this.bounds = this.__layout = this.__children = null;
  }
});
