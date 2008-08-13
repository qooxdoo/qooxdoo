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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * The background class contains methods to compute and set the background image
 * of a DOM element.
 *
 * It fixes a background position issue in Firefox 2.
 */
qx.Class.define("qx.bom.element.Background",
{
  statics :
  {
    /** {Array} Internal helper to improve compile performance */
    __tmpl :
    [
      "background-image:url(", null, ");",
      "background-position:", null, ";",
      "background-repeat:", null, ";"
    ],


    /** {Map} Empty styles when no image is given */
    __emptyStyles :
    {
      backgroundImage : null,
      backgroundPosition : null,
      backgroundRepeat : null
    },


    /**
     * Compiles the background into a CSS compatible string.
     *
     * @param source {String?null} The URL of the background image
     * @param repeat {String?null} The background repeat property. valid values
     *     are <code>repeat</code>, <code>repeat-x</code>,
     *     <code>repeat-y</code>, <code>no-repeat</code>
     * @param left {Integer?null} The horizontal offset of the image inside of
     *     the image element.
     * @param top {Integer?null} The vertical offset of the image inside of
     *     the image element.
     * @return {String} CSS string
     */
    compile : function(source, repeat, left, top)
    {
      // Correcting buggy Firefox background-position implementation
      // Have problems with identical values
      var Engine = qx.bom.client.Engine;
      if (Engine.GECKO && Engine.VERSION < 1.9 && left == top && left != null) {
        top += 0.01;
      }

      if (left != null || top != null) {
        var position = (left == null ? "0px" : left + "px") + " " + (top == null ? "0px" : top + "px")
      } else {
        var position = "0 0";
      }

      // for IE check the given url for "HTTPS" to avoid "Mixed content" warnings
      var backgroundImageUrl = qx.util.ResourceManager.toUri(source);
      if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        backgroundImageUrl = this.__checkImageUrl(backgroundImageUrl);
      }

      // Updating template
      var tmpl = this.__tmpl;

      tmpl[1] = backgroundImageUrl;
      tmpl[4] = position;
      tmpl[7] = repeat;

      return tmpl.join("");
    },


    /**
     * Get standard css background styles
     *
     * @param source {String} The URL of the background image
     * @param repeat {String?null} The background repeat property. valid values
     *     are <code>repeat</code>, <code>repeat-x</code>,
     *     <code>repeat-y</code>, <code>no-repeat</code>
     * @param left {Integer?null} The horizontal offset of the image inside of
     *     the image element.
     * @param top {Integer?null} The vertical offset of the image inside of
     *     the image element.
     */
    getStyles : function(source, repeat, left, top)
    {
      if (!source) {
        return this.__emptyStyles;
      }

      var Engine = qx.bom.client.Engine;
      if (Engine.GECKO && Engine.VERSION < 1.9 && left == top && left != null) {
        top += 0.01;
      }

      if (left != null || top != null) {
        var position = (left == null ? "0px" : left + "px") + " " + (top == null ? "0px" : top + "px")
      }

      // for IE check the given url for "HTTPS" to avoid "Mixed content" warnings
      var backgroundImageUrl = qx.util.ResourceManager.toUri(source);
      if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        backgroundImageUrl = this.__checkImageUrl(backgroundImageUrl);
      }

      var map = {
        backgroundImage : "url(" + backgroundImageUrl + ")"
      };

      if (position != null) {
        map.backgroundPosition = position;
      }

      if (repeat != null) {
        map.backgroundRepeat = repeat;
      }

      return map;
    },


    /**
     * Set the background on the given DOM element
     *
     * @param element {Element} The element to modify
     * @param source {String?null} The URL of the background image
     * @param repeat {String?null} The background repeat property. valid values
     *     are <code>repeat</code>, <code>repeat-x</code>,
     *     <code>repeat-y</code>, <code>no-repeat</code>
     * @param left {Integer?null} The horizontal offset of the image inside of
     *     the image element.
     * @param top {Integer?null} The vertical offset of the image inside of
     *     the image element.
     */
    set : function(element, source, repeat, left, top)
    {
      var styles = this.getStyles(source, repeat, left, top);
      for (var prop in styles) {
        element.style[prop] = styles[prop];
      }
    },


    /**
     *
     * @param {Object} url
     */
    __checkImageUrl : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(url)
      {
        var urlPrefix = "";

        /*
         * To avoid a "mixed content" warning in IE when the application is
         * delivered via HTTPS a prefix has to be added. This will transform the
         * relative URL to an absolute one in IE.
         * Though this warning is only displayed in conjunction with images which
         * are referenced as a CSS "background-image", every resource path is
         * changed when the application is served with HTTPS.
         */
        if (window.location.protocol === "https:")
        {
          /*
           * SPECIAL CASE
           * It is valid to to begin a URL with "//" so this case has to
           * be considered. If the to resolved URL begins with "//" the
           * manager prefixes it with "https:" to avoid any problems for IE
           */
          if (url.match(/^\/\//) != null) {
            urlPrefix = window.location.protocol;
          }

          /*
           * If the resolved URL begins with "./" the final URL has to be
           * put together using the document.URL property.
           */
          else if (url.match(/^\.\//) != null)
          {
            url  = url.substring(url.indexOf("/"));
            urlPrefix = document.URL.substring(0, document.URL.lastIndexOf("/"));
          }
          else
          {
            urlPrefix = window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1);
          }
        }

        return urlPrefix + url;
      },

      "default" : function(){}
    })
  }
});