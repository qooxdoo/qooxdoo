/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * This is a simple button widget which takes care of setting the label
 * and icon of a button.
 *
 * <h2>Markup</h2>
 * The Button can contain a <code>span</code> element for the label and/or
 * an <code>img</code> element for the icon.
 *
 * <h2>CSS Classes</h2>
 * <table>
 *   <thead>
 *     <tr>
 *       <td>Class Name</td>
 *       <td>Applied to</td>
 *       <td>Description</td>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td><code>qx-button</code></td>
 *       <td>Container element</td>
 *       <td>Identifies the Button widget</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * <h2 class="widget-markup">Generated DOM Structure</h2>
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Button", {
  extend : qx.ui.website.Widget,

  statics : {
    /**
     * Factory method for the button widget which converts a standard
     * collection into a collection of buttons.
     *
     * @param label {String?} The label of the button.
     * @param icon {String?} The url for the button icon.
     * @return {qx.ui.website.Button} A collection of buttons.
     *
     * @attach {qxWeb}
     */
    button : function(label, icon) {
      var buttons = new qx.ui.website.Button(this);
      buttons.init();
      if (label != null) {
        buttons.setLabel(label);
      }
      if (icon != null) {
        buttons.setIcon(icon);
      }

      return buttons;
    }
  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },


  members : {
    // overridden
    init : function() {
      if (!this.base(arguments)) {
        return false;
      }

      if (this.getChildren("span") == 0) {
        qxWeb.create("<span>").appendTo(this);
      }

      if (this.getChildren("img") == 0) {
        qxWeb.create("<img>").appendTo(this).setStyle("display", "none");
      }

      return true;
    },


    /**
     * Sets the button's label text
     *
     * @param value {String} label text
     * @return {qxWeb} The collection for chaining
     */
    setLabel : function(value) {
      this.getChildren("span").setHtml(value);
      return this;
    },


    /**
     * Returns the button's label text
     *
     * @return {String} label text
     */
    getLabel : function() {
      return this.getChildren("span").getHtml();
    },


    /**
     * Sets the source of the button's icon
     *
     * @param src {String} source URI for the icon
     * @return {qxWeb} The collection for chaining
     */
    setIcon : function(src) {
      var img = this.getChildren("img");
      img.setAttribute("src", src);
      img.setStyle("display", src ? "inline" : "none");

      return this;
    },


    /**
     * Returns the URI of the button's icon
     *
     * @return {String|null} Icon image URI
     */
    getIcon : function() {
      return this.getChildren("img").getAttribute("src");
    },


    /**
     * Sets the menu to be shown when the button is clicked or tapped
     *
     * @param menu {qxWeb} menu element wrapped in a collection
     * @return {qxWeb} The collection for chaining
     */
    setMenu : function(menu) {
      this.on("tap", function(e) {
        if (menu.getStyle("display") === "none") {
          menu.placeTo(this, "bottom-left");
          menu.show();
          qxWeb(document).once("tap", function() {
            menu.hide();
          });
        } else {
          menu.hide();
        }
        e.stopPropagation();
      });

      return this;
    }
  },


  defer : function(statics) {
    qxWeb.$attach({button : statics.button});
  }
});
