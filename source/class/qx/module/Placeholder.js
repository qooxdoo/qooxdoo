/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * The module supplies a fallback implementation for placeholders, which is
 * used on input and textarea elements. If the browser supports native placeholders
 * the API silently ignores all calls. If not, an element will be created for every
 * given input element and acts as placeholder. Most modern browsers support
 * placeholders which makes the fallback only relevant for IE < 10 and FF < 4.
 *
 *  * <a href="http://dev.w3.org/html5/spec/single-page.html#the-placeholder-attribute">HTML Spec</a>
 *
 *  * <a href="http://caniuse.com/#feat=input-placeholder">Browser Support</a>
 *
 * @require(qx.module.Manipulating)
 * @require(qx.module.Css)
 * @require(qx.module.Attribute)
 * @require(qx.module.Event)
 * @require(qx.module.Environment)
 * @require(qx.module.Polyfill)
 * @require(qx.module.Traversing)
 */
qx.Bootstrap.define("qx.module.Placeholder", {
  statics :
  {
    /**
     * String holding the property name which holds the placeholder
     * element for each input.
     */
    PLACEHOLDER_NAME : "$qx_placeholder",


    /**
     * Queries for all input and textarea elements on the page and updates
     * their placeholder.
     * @attachStatic{qxWeb, placeholder.update}
     */
    update : function() {
      // ignore if native placeholder are supported
      if (!qxWeb.env.get("css.placeholder")) {
        qxWeb("input[placeholder], textarea[placeholder]").updatePlaceholder();
      }
    },


    /**
     * Internal helper method to update the styles for a given input element.
     * @param item {qxWeb} The input element to update.
     */
    __syncStyles : function(item) {
      var placeholder = item.getAttribute("placeholder");
      var placeholderEl = item.getProperty(qx.module.Placeholder.PLACEHOLDER_NAME);

      var zIndex= item.getStyle("z-index");

      var paddingHor = parseInt(item.getStyle("padding-left")) + 2 * parseInt(item.getStyle("padding-right"));
      var paddingVer = parseInt(item.getStyle("padding-top")) + 2 * parseInt(item.getStyle("padding-bottom"));

      placeholderEl.setHtml(placeholder).setStyles({
        display : item.getValue() == "" ? "inline" : "none",
        zIndex : zIndex == "auto" ? 1 : zIndex + 1,
        textAlign: item.getStyle("text-align"),
        width: (item.getWidth() - paddingHor - 4) + "px",
        height: (item.getHeight() - paddingVer - 4) + "px",
        left: item.getPosition().left + "px",
        top: item.getPosition().top + "px",
        fontFamily : item.getStyle("font-family"),
        fontStyle : item.getStyle("font-style"),
        fontVariant : item.getStyle("font-variant"),
        fontWeight : item.getStyle("font-weight"),
        fontSize : item.getStyle("font-size"),
        paddingTop : (parseInt(item.getStyle("padding-top")) + 2) + "px",
        paddingRight : (parseInt(item.getStyle("padding-right")) + 2) + "px",
        paddingBottom : (parseInt(item.getStyle("padding-bottom")) + 2) + "px",
        paddingLeft : (parseInt(item.getStyle("padding-left")) + 2) + "px"
      });
    },


    /**
     * Creates a placeholder element based on the given input element.
     * @param item {qxWeb} The input element.
     * @return {qxWeb} The placeholder element.
     */
    __createPlaceholderElement : function(item) {
      // create the label with initial styles
      var placeholderEl = qxWeb.create("<label>").setStyles({
        position: "absolute",
        color: "#989898",
        overflow: "hidden",
        pointerEvents : "none"
      });
      // store the label at the input field
      item.setProperty(qx.module.Placeholder.PLACEHOLDER_NAME, placeholderEl);

      // update the placeholders visibility on keyUp
      item.on("keyup", function(item) {
        var el = item.getProperty(qx.module.Placeholder.PLACEHOLDER_NAME);
        el.setStyle("display", item.getValue() == "" ? "inline" : "none");
      }.bind(this, item));

      // for browsers not supporting pointer events
      if (!qxWeb.env.get("css.pointerevents")) {
        placeholderEl.setStyle("cursor", "text").on("tap", function(item) {
          item.focus();
        }.bind(this, item));
      }
      return placeholderEl;
    }
  },

  members :
  {

    /**
     * Updates the placeholders for input's and textarea's in the collection.
     * This includes positioning, styles and DOM positioning.
     * In case the browser supports native placeholders, this methods simply
     * does nothing.
     *
     * @attach {qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    updatePlaceholder : function() {
      // ignore everything if native placeholder are supported
      if (!qxWeb.env.get("css.placeholder")) {
        for (var i=0; i < this.length; i++) {
          var item = qxWeb(this[i]);

          // ignore all not fitting items in the collection
          var placeholder = item.getAttribute("placeholder");
          var tagName = item.getProperty("tagName");
          if (!placeholder || (tagName != "TEXTAREA"&& tagName != "INPUT")) {
            continue;
          }

          // create the element if necessary
          var placeholderEl = item.getProperty(qx.module.Placeholder.PLACEHOLDER_NAME);
          if (!placeholderEl) {
            placeholderEl = qx.module.Placeholder.__createPlaceholderElement(item);
          }

          // remove and add handling
          var itemInBody = item.isRendered();
          var placeholderElInBody = placeholderEl.isRendered();
          if (itemInBody && !placeholderElInBody) {
            item.before(placeholderEl);
          } else if (!itemInBody && placeholderElInBody) {
            placeholderEl.remove();
            return this;
          }

          qx.module.Placeholder.__syncStyles(item);
        };
      }
      return this;
    }
  },


  defer : function(statics) {
    qxWeb.$attachAll(this, "placeholder");
  }
});
