/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
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
 * A scroll bar
 */
qx.Class.define("qx.ui2.core.ScrollBar",
{
  extend : qx.ui2.core.Widget,

  construct : function(orientation)
  {
    this.base(arguments);

    if (orientation != null) {
      this.setOrientation(orientation);
    }
  },


  properties :
  {
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },

    value :
    {
      check : "Integer",
      init : 0,
      apply : "_applyValue",
      event : "scroll"
    },

    maximum :
    {
      check : "Integer",
      init : 100
    }
  },


  members :
  {
    _applyOrientation : function(value, old)
    {
      if (old) {
        throw new Error("Modification of orientation is not allowed!");
      }

      var hori = value === "horizontal";

      var layout = hori ? new qx.ui2.layout.HBox : new qx.ui2.layout.VBox;
      this.setLayout(layout);

      this._barPane = new qx.ui2.core.Widget();
      this._barPane.setBackgroundColor("#EEE");

      if (hori) {
        this._barPane.setHeight(18);
      } else {
        this._barPane.setWidth(18);
      }

      this._btnBegin = new qx.ui2.core.Label(hori ? "<" : "U").set({
        backgroundColor : "gray",
        padding : 3
      });

      this._btnEnd = new qx.ui2.core.Label(hori ? ">" : "D").set({
        backgroundColor : "gray",
        padding : 3
      });

      this._btnBegin.addListener("click", this._scrollToBegin, this);
      this._btnEnd.addListener("click", this._scrollToEnd, this);

      // Add children to layout
      layout.add(this._btnBegin);
      layout.add(this._barPane, {flex: 1});
      layout.add(this._btnEnd);
    },

    _scrollToBegin : function() {
      this.scrollBy(-10);
    },

    _scrollToEnd : function() {
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

    _applyValue : function(value, old) {},

    canStretchX : function() {
      return this.getOrientation() === "horizontal";
    },

    canStretchY : function() {
      return this.getOrientation() !== "horizontal";
    }
  }
});
