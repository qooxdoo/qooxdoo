/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * The intention of this class is to bring more convenience to the attribute
 * and style features implemented by the other classes. It wraps the features
 * of multiple classes in one unique interface.
 *
 * There is a automatic detection if the given name should be interpreted
 * as HTML property, attribute or style. It even supports complex
 * setter/getter pairs like opacity. All these features are usable through
 * the same interface by just using the name of the attribute/style etc. to
 * modify/query.
 *
 * This class is optimized for performance, but is not as optimal in performance
 * aspects than the more native implementations. For all highly performance
 * crititcal areas like animations it would be the best to directly use the
 * classes which contain the implementations.
 */
qx.Class.define("qx.html2.element.Generic",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Creates an DOM element
     *
     * @type static
     * @param name {String} Tag name of the element
     * @param win {Window} Window to create document for
     * @param xhtml {Boolean ? false} Enable XHTML
     * @return {Element} the created element node
     */
    create : function(name, win, xhtml)
    {
      if (!win) {
        win = window;
      }

      if (xhtml) {
        return win.document.createElementNS("http://www.w3.org/1999/xhtml", name);
      } else {
        return win.document.createElement(name);
      }
    },
    
    
    
    
    
    
    
    
        
    /**
     * This internal data will be automatically translated to a full blown
     * map structure in __init()
     */
    __generic :
    {
      attributes :
      [
        "class", "text", "html", "name", "id",
        "href", "src", "type", "for",
        "colspan", "rowspan", "valign", "datetime", "accesskey",
        "tabindex", "enctype", "maxlength", "readonly", "longdesc",
        "disabled", "checked", "multiple", "selected", "value",
        "title"
      ],

      styles :
      [
        "minWidth", "width", "maxWidth",
        "minHeight", "height", "maxHeight",
        "top", "right", "bottom", "left",
        "border",
        "borderTop", "borderRight", "borderBottom", "borderLeft",
        "margin",
        "marginTop", "marginRight", "marginBottom", "marginLeft",
        "padding",
        "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
        "float", "clear",
        "color", "backgroundColor",
        "font", "fontFamily"
      ],

      custom :
      {
        "opacity" : qx.html2.element.Opacity,
        "cursor" : qx.html2.element.Cursor,
        "clip" : qx.html2.element.Clip,
        "overflow" : qx.html2.element.Overflow
      }
    },


    /**
     * Applies the given attribute or style to the element.
     * Automatically determines if the given key should be
     * interpreted as a style property, attribute name, or
     * custom setter.
     *
     * @type static
     * @param element {Element} DOM element to modify
     * @param key {String} Name of attribute or style
     * @param value {var} Any acceptable value for the given attribute or style
     * @return {var} the new value
     * @throws an exception if the given key couldn't be processed
     */
    set : function(element, key, value)
    {
      var gen = this.__generic;

      if (gen.attributes[key]) {
        return qx.html2.element.Attribute.set(element, key, value);
      } else if (gen.styles[key]) {
        return qx.html2.element.Style.set(element, key, value);
      } else if (gen.custom[key]) {
        return gen.custom[key].set(element, value);
      }

      throw new Error("Generic set() has no informations about: " + key);
    },


    /**
     * Returns the given attribute or style of the element.
     * Automatically determines if the given key should be
     * interpreted as a style property, attribute name, or
     * custom setter.
     *
     * @type static
     * @param element {Element} DOM element to modify
     * @param key {String} Name of attribute or style
     * @return {var} the resulting value
     * @throws an exception if the given key couldn't be processed
     */
    get : function(element, key)
    {
      var gen = this.__generic;

      if (gen.attributes[key]) {
        return qx.html2.element.Attribute.get(element, key);
      } else if (gen.styles[key]) {
        return qx.html2.element.Style.get(element, key);
      } else if (gen.custom[key]) {
        return gen.custom[key].get(element);
      }

      throw new Error("Generic get() has no informations about: " + key);
    },


    /**
     * Preprocesses and translates <code>__generic</code> data
     * structure and creates a larger but faster accessible table
     * for later usage.
     *
     * @type static
     * @return {void}
     */
    __init : function()
    {
      var generic = this.__generic;

      var map =
      {
        attributes : {},
        styles     : {},
        custom     : {}
      };

      var name, hints, source, target;

      // Process attributes
      hints = qx.html2.element.Attribute.__hints.names;
      source = generic.attributes;
      target = map.attributes;

      for (var i=0, l=source.length; i<l; i++)
      {
        name = source[i];
        target[name] = true;

        if (hints[name]) {
          target[hints[name]] = true;
        }
      }

      // Process styles
      hints = qx.html2.element.Style.__hints.names;
      source = generic.styles;
      target = map.styles;

      for (var i=0, l=source.length; i<l; i++)
      {
        name = source[i];
        target[name] = true;

        if (hints[name]) {
          target[hints[name]] = true;
        }
      }

      // custom attributes
      map.custom = generic.custom;

      this.__generic = map;
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
