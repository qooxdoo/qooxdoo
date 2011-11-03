/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
qx.Bootstrap.define("qx.bom.element.Transform", 
{
  statics :
  {
    __transitionKeys : {
      "scale": true,
      "rotate" : true,
      "skew" : true,
      "translate" : true
    },

    __dimensions : ["X", "Y", "Z"],

    __cssKeys : qx.core.Environment.get("css.transform"),

    translate : function(el, value) {
      this.transform(el, {translate: value});
    },

    scale : function(el, value) {
      this.transform(el, {scale: value});
    },

    rotate : function(el, value) {
      this.transform(el, {rotate: value});
    },

    skew : function(el, value) {
      this.transform(el, {skew: value});
    },


    transform : function(el, transforms) {
      var transformCss = this.__mapToCss(transforms);
      if (transformCss != "") {
        var style = this.__cssKeys["name"];
        el.style[style] = transformCss;
      }
    },




    setOrigin : function(el, value) {
      el.style[this.__cssKeys["origin"]] = value;
    },

    getOrigin : function(el) {
      return el.style[this.__cssKeys["origin"]];
    },



    setStyle : function(el, value) {
      el.style[this.__cssKeys["style"]] = value;
    },

    getStyle : function(el) {
      return el.style[this.__cssKeys["style"]];
    },



    setPerspective : function(el, value) {
      el.style[this.__cssKeys["perspective"]] = value;
    },

    getPerspective : function(el) {
      return el.style[this.__cssKeys["perspective"]];
    },


    setPerspectiveOrigin : function(el, value) {
      el.style[this.__cssKeys["perspective-origin"]] = value;
    },

    getPerspectiveOrigin : function(el) {
      return el.style[this.__cssKeys["perspective-origin"]];
    },


    setBackfaceVisibility : function(el, value) {
      el.style[this.__cssKeys["backface-visibility"]] = value ? "visible" : "hidden";
    },


    getBackfaceVisibility : function(el) {
      return el.style[this.__cssKeys["backface-visibility"]] == "visible";
    },


    __mapToCss : function(transforms) {
      var value = "";
      for (var func in transforms) {

        var params = transforms[func];
        // if an array is given
        if (qx.lang.Type.isArray(params)) {
          for (var i=0; i < params.length; i++) {
            if (params[i] == undefined) {
              continue;
            }
            value += func + this.__dimensions[i] + "(";
            value += params[i];
            value += ") ";
          };
        // case for single values given
        } else {
          // single value case
          value += func + "(" + transforms[func] + ") ";
        }
      }

      return value;
    }
  }
});