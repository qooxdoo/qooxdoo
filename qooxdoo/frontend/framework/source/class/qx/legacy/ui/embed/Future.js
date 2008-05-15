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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Embed a new qooxdoo 0.8 widget into a legacy ui application.
 */
qx.Class.define("qx.legacy.ui.embed.Future",
{
  extend : qx.legacy.ui.basic.Terminator,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

 construct : function()
 {
    this.base(arguments);

    this.set({
      backgroundColor: "yellow",
      overflow: "hidden"
    });
 },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The qooxdoo 0.8 widget to embed. The widget will be stretched to the size
     * of the embed widget.
     */
    content :
    {
      check : "qx.ui.core.Widget",
      apply : "_applyContent",
      init : null,
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
    _applyContent : function(value, old)
    {
      if (this._root)
      {
        if (old) {
          this._root.remove(old);
        }

        if (value) {
          this._root.add(value);
        }
      }
    },


    // overridden
    _computePreferredInnerWidth : function()
    {
      var content = this.getContent();
      if (content) {
        return content.getSizeHint().width;
      } else {
        return 100;
      }
    },


    // overridden
    _computePreferredInnerHeight : function()
    {
      var content = this.getContent();
      if (content) {
        return content.getSizeHint().height;
      } else {
        return 50;
      }
    },


    // overridden
    _changeInnerWidth : function(vNew, vOld)
    {
      this.base(arguments, vNew, vOld);
      this._setPaneWidth(this.getBoxWidth());
    },


    // overridden
    _changeInnerHeight : function(vNew, vOld)
    {
      this.base(arguments, vNew, vOld);
      this._setPaneHeight(this.getBoxHeight());
    },


    /**
     * Sets the size of the content
     *
     * @param width {Integer} new width
     */
    _setPaneWidth : function(width) {
      this._root.setWidth(width);
    },


    /**
     * Sets the size of the content
     *
     * @param height {Integer} new height
     */
    _setPaneHeight : function(height) {
      this._root.setHeight(height);
    },


    // overridden
    _afterAppear : function()
    {
      var el = this.getElement();
      var rootEl = document.createElement("div");

      el.appendChild(rootEl);
      this._root = new qx.ui.root.Inline(rootEl);
      this._root.setLayout(new qx.ui.layout.Canvas());

      var content = this.getContent();
      if (content) {
        this._root.add(content, {top: 0, right: 0, bottom: 0, left: 0});
      }

      this._setPaneWidth(this.getBoxWidth());
      this._setPaneHeight(this.getBoxHeight());
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_root")
  }
});