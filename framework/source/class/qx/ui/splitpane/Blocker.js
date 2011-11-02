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

************************************************************************ */
/* ************************************************************************

#asset(qx/static/blank.gif)

************************************************************************ */
/**
 * A special blocker element for the splitpane which is based on
 * {@link qx.html.Element} and takes care of the positioning of the div.
 * @internal
 */
qx.Class.define("qx.ui.splitpane.Blocker",
{
  extend : qx.html.Element,

  /**
   * @param orientation {String} The orientation of the split pane control.
   */
  construct : function(orientation)
  {
    var styles = {
      position: "absolute",
      zIndex: 11
    };

    // IE needs some extra love here to convince it to block events.
    if ((qx.core.Environment.get("engine.name") == "mshtml"))
    {
      styles.backgroundImage = "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")";
      styles.backgroundRepeat = "repeat";
    }

    this.base(arguments, "div", styles);

    // Initialize orientation
    if (orientation) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },


  properties :
  {
    /**
     * The orientation of the blocker which should be the same as the
     * orientation of the splitpane.
     */
    orientation :
    {
      init  : "horizontal",
      check : [ "horizontal", "vertical" ],
      apply : "_applyOrientation"
    }
  },


  members :
  {

    // property apply
    _applyOrientation : function(value, old) {
      if (value == "horizontal") {
        this.setStyle("height", "100%");
        this.setStyle("cursor", "col-resize");
        this.setStyle("top", null);
      } else {
        this.setStyle("width", "100%");
        this.setStyle("left", null);
        this.setStyle("cursor", "row-resize");
      }
    },


    /**
     * Takes the two parameters and set the propper width of the blocker.
     *
     * @param offset {Number} The offset of the splitpane.
     * @param spliterSize {Number} The width of the splitter.
     */
    setWidth : function(offset, spliterSize) {
      var width = spliterSize + 2 * offset;
      this.setStyle("width", width + "px");
    },


    /**
     * Takes the two parameter and sets the propper height of the blocker.
     *
     * @param offset {Number} The offset of the splitpane.
     * @param spliterSize {Number} The height of the splitter.
     */
    setHeight : function(offset, spliterSize) {
      var height = spliterSize + 2 * offset;
      this.setStyle("height", height + "px");
    },


    /**
     * Takes the two parameter and sets the propper left position of
     * the blocker.
     *
     * @param offset {Number} The offset of the splitpane.
     * @param splitterLeft {Number} The left position of the splitter.
     */
    setLeft : function(offset, splitterLeft) {
      var left = splitterLeft - offset;
      this.setStyle("left", left + "px");
    },


    /**
     * Takes the two parameter and sets the propper top position of
     * the blocker.
     *
     * @param offset {Number} The offset of the splitpane.
     * @param splitterTop {Number} The top position of the splitter.
     */
    setTop : function(offset, splitterTop) {
      var top = splitterTop - offset;
      this.setStyle("top", top + "px");
    }
  }
});