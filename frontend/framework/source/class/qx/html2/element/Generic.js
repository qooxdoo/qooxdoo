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

qx.Class.define("qx.html2.element.Generic",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  
  statics :
  {
    /** This internal data will be automatically translated to a full blown map structure in __init */
    __generic :
    {
      attributes : 
      [
        "class", "text", "html", "name", "id", "href", "src", "type", "for",
        "colspan", "rowspan", "valign", "datetime", "accesskey", "tabindex", 
        "enctype", "maxlength", "readonly", "longdesc", "disabled", "checked", 
        "multiple", "selected", "value"
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
        "color", "backgroundColor"
      ],
      
      custom : 
      [
        "opacity"
      ] 
    },
    
    
    /**
     * Applies the given attribute or style to the element
     *
     * @type 
     * @param el {Element} DOM element to modify
     * @param key {String} Name of attribute or style
     * @param value {var} Any acceptable value for the given attribute or style
     */
    set : function(el, key, value)
    {
      var gen = this.__generic;
      
      if (gen.attributesMap[key]) {
        return this.setAttribute(el, key, value);
      } else if (gen.stylesMap[key]) {
        return this.setStyle(el, key, value);
      } else if (gen.customMap[key]) {
        return this[gen.customMap[key].set](el, key, value);
      }
      
      throw new Error("Generic set() has no informations about: " + key);
    },
    
    get : function(el, key)
    {
      var gen = this.__generic;
      
      if (gen.attributesMap[key]) {
        return this.getAttribute(el, key);
      } else if (gen.stylesMap[key]) {
        return this.getStyle(el, key);
      } else if (gen.customMap[key]) {
        return this[gen.customMap[key].get](el, key);
      }
      
      throw new Error("Generic get() has no informations about: " + key);      
    },
    
    __init : function(statics)
    {
      var generic = this.__generic;
      var map = 
      {
        attributes : {},  
        styles : {},
        custom : {}
      };
      
      var name, hints, data;
      
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
      
      // Process custom
      source = generic.custom;
      target = map.custom;
      var str = qx.lang.String;
      var up;
      for (var i=0, l=source.length; i<l; i++)
      {
        name = source[i];
        up = str.toFirstUp(name);
        target[name] = { set : "set" + up, get : "get" + up };
      }       
      
      // Replace old array with new map
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
