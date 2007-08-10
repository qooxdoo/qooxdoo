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
#require(qx.bom.Element)
#require(qx.bom.element.Class)

************************************************************************ */

/**
 * Implements the fly weight pattern for DOM elements.
 *
 * Most of the methods of the classes in {@link qx.bom.element} and {@link qx.dom} are available.
 * Some with really generic names are automatically translated e.g.
 * <code>get()</code> -> <code>getCursor()</code>
 *
 * Also included the the generic <code>set()</code>, <code>get()</code> and <code>reset()</code>
 * methods of {@link qx.bom.Element}.
 */
qx.Class.define("qx.bom.FlyWeight",
{
  statics :
  {
    /**
     * Connects a new node to be used later. 
     * This automatically disconnects the previous one
     * 
     * @type static
     * @param element {Element} DOM element to connect
     * @return {Object} The wrapped element
     */
    connect : function(element) 
    {
      this.__wrap._element = element;
      return this.__wrap;
    },
    

    /**
     * Disconnects the current element from the class.
     * 
     * @type static
     * @return {Element|null} The now disconnected DOM element
     */
    disconnect : function() 
    {
      var el = this.__wrap._element;
      if (el) {
        delete this.__wrap._element;
      }
      
      return el || null;
    },
    

    /**
     * Retrieves the current wrapped element
     * 
     * @type static
     * @return {Element|null} The currently connected DOM element
     */
    get : function() {
      return this.__wrap._element || null;
    },
    
    
    /** Internal map of keys to block from getting mapped */
    __block :
    {
      toString : true,
      classname : true,
      name : true,
      basename : true,
      fly : true,
      create : true
    },
    
    
    /** Translation of function names specified in the listed classes */
    __translation :
    {
      "qx.bom.element.Attribute" :
      {
        get : "getAttribute",
        set : "setAttribute",
        reset : "resetAttribute"
      },
      
      "qx.bom.element.Class" :  
      {
        add : "addClass",
        has : "hasClass",
        remove : "removeClass",
        replace : "replaceClass",
        toggle : "toggleClass" 
      },   
      
      "qx.bom.element.Clip" :
      {
        get : "getClip",
        set : "setClip",
        reset : "resetClip"
      },    
      
      "qx.bom.element.Cursor" :
      {
        get : "getCursor",
        set : "setCursor",
        reset : "resetCursor"
      },  
      
      "qx.bom.element.Location" :
      {
        get : "getLocation",
        getLeft : "getLocationLeft",
        getTop : "getLocationTop",
        getRelative : "getRelativeLocation"
      },      
      
      "qx.bom.element.Opacity" :
      {
        get : "getOpacity",
        set : "setOpacity",
        reset : "resetOpacity"
      },               

      "qx.bom.element.Overflow" :
      {
        getX : "getOverflowX",
        setX : "setOverflowX",
        resetX : "resetOverflowX",
        getY : "getOverflowY",
        setY : "setOverflowY",
        resetY : "resetOverflowY"
      },     
      
      "qx.bom.element.Scroll" :
      {
        getX : "getScrollX",
        setX : "setScrollX",
        resetX : "resetScrollX",
        getY : "getScrollY",
        setY : "setScrollY",
        resetY : "resetScrollY",
        intoView : "scrollIntoView",
        intoViewX : "scrollIntoViewX",
        intoViewY : "scrollIntoViewY"
      },         
      
      "qx.bom.element.Style" : 
      {
        get : "getStyle",
        set : "setStyle",
        reset : "resetStyle",
        getCascaded : "getCascadedStyle",
        getComputed : "getComputedStyle"
      },
      
      "qx.bom.element.Visibility" :
      {
        get : "getVisibility",
        set : "setVisibility",
        reset : "resetVisibility",
        toggle : "toggleVisibility"
      }      
    },
    
    /** Internal map which contains the wrapped functions */
    __wrap : {},
    
    
    /** 
     * Initializes the methods of a given class (wraps them to be usable)
     * 
     * @type static
     * @param clazz {Class} Class to initialize
     * @return {void}
     */
    __initClass : function(clazz)
    {
      var block = this.__block;
      var translation = this.__translation;
      var classname = clazz.classname;
      var wrap = this.__wrap;
      var value;

      // console.log("Class: " + classname);
      
      for (var key in clazz) 
      {
        if (block[key] || key.charAt(0) === "_") {
          continue; 
        }
        
        value = clazz[key];
        
        if (!(value instanceof Function)) {
          continue; 
        }

        // Translate function names        
        if (translation[classname]) {
          target = translation[classname][key] || key; 
        } else {
          target = key; 
        }
        
        // console.log("  - Key: " + key);
        
        // Map into wrapper function
        // Return the value when target name starts with "get".
        // Otherwise return the wrapper object for chaining support.
        if (target.indexOf("get") === 0) {
          wrap[target] = new Function("var args = qx.lang.Array.fromArguments(arguments); args.unshift(this._element); return " + classname + "." + key + ".apply(" + classname + ", args);");
        } else {
          wrap[target] = new Function("var args = qx.lang.Array.fromArguments(arguments); args.unshift(this._element); " + classname + "." + key + ".apply(" + classname + ", args); return this;");          
        }
      }
    },
    
    
    /** 
     * Initializes the classes of a given namespace (wraps methods to make them usable)
     * 
     * @type static
     * @param ns {Object} Namespace to look up for classes
     * @return {void}
     */
    __initNamespace : function(ns)
    {
      for (var classname in ns) {
        this.__initClass(ns[classname]);
      }
    }    
  },
  
  defer : function(statics)
  {
    statics.__initNamespace(qx.bom.element);
    statics.__initNamespace(qx.dom);
    statics.__initClass(qx.bom.Element);
  }
});
