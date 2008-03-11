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

************************************************************************ */

qx.Bootstrap.define("qx.io2.ImageLoader",
{
  statics :
  {
    __data : {},


    load : function(source, callback, context)
    {
      // Shorthand
      var data = this.__data;

      // Normalize context
      if (callback && !context) {
        context = window;
      }

      // Already known image source
      if (data[source])
      {
        if (callback) {
          callback.call(context);
        }

        return;
      }

      // Create image element
      var el = new Image();

      el.onload = qx.lang.Function.bind(this.__onload, this, el, callback, context);
      el.onerror = qx.lang.Function.bind(this.__onerror, this, el);

      el.src = source;
    },


    __onload : function(element, callback, context)
    {
      // Shorthand
      var data = this.__data;

      // Store dimensions
      data[source] =
      {
        width : this.__getWidth(element),
        height : this.__getHeight(element)
      }

      // Cleanup listeners
      element.onload = element.onerror = null;

      // Execute callback
      if (callback) {
        callback.call(context);
      }
    },


    __onerror : function(element)
    {
      // Cleanup listeners
      element.onload = element.onerror = null;

      // Throw error
      throw new Error("Could not load image: " + element.src);
    },


    __getWidth : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(element) {
        return element.naturalWidth;
      },

      "default" : function(element) {
        return element.width;
      }
    }),


    __getHeight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(element) {
        return element.naturalHeight;
      },

      "default" : function(element) {
        return element.height;
      }
    })
  }
});
