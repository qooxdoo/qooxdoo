/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copybottom:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A vertical scroll bar
 */
qx.Class.define("qx.ui2.core.VScrollBar",
{
  extend : qx.ui2.core.Widget,

  construct : function()
  {
    this.base(arguments);

    var layout = new qx.ui2.layout.VBox;
    this.setLayout(layout);

    this._barPane = new qx.ui2.core.Widget;
    this._barPane.setBackgroundColor("#DDD");

    this._upButton = new qx.ui2.core.Label("U").set({
      backgroundColor : "gray"
    });

    this._downButton = new qx.ui2.core.Label("D").set({
      backgroundColor : "gray"
    });

    this._upButton.addListener("click", this._scrollUp, this);
    this._downButton.addListener("click", this._scrollDown, this);

    // Add children to layout
    layout.add(this._upButton);
    layout.add(this._barPane, {flex: 1});
    layout.add(this._downButton);
  },


  properties :
  {
    value :
    {
      check : "Integer",
      init : 0,
      apply : "_applyValue"
    },

    maximum :
    {
      check : "Integer",
      init : 100
    }
  },


  members :
  {
    _scrollUp : function() {
      this.scrollBy(-10);
    },

    _scrollDown : function() {
      this.scrollBy(10);
    },

    scrollBy : function(value)
    {
      var old = this.getValue();
      this.scrollTo(old + value);
    },

    scrollTo : function(value)
    {
      var max = this.getMaximum();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }

      this.setValue(value);
    },

    _applyValue : function(value, old)
    {
      this.debug("Value: " + value);
    }
  }
});
