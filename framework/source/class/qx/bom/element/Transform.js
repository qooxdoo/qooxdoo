/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * This class is responsible for applying CSS3 transforms to plain DOM elements.
 * The implementation is mostly a cross browser wrapper for applying the
 * transforms.
 * The API is keep to the spec as close as possible.
 *
 * http://www.w3.org/TR/css3-3d-transforms/
 */
qx.Bootstrap.define("qx.bom.element.Transform",
{
  statics :
  {
    /** Internal storage of the CSS names */
    __cssKeys : qx.core.Environment.get("css.transform"),


    /**
     * Method to apply multiple transforms at once to the given element. It
     * takes a map containing the transforms you want to apply plus the values
     * e.g.<code>{scale: 2, rotate: "5deg"}</code>.
     * The values can be either singular, which means a single value will
     * be added to the CSS. If you give an array, the values will be split up
     * and each array entry will be used for the X, Y or Z dimension in that
     * order e.g. <code>{scale: [2, 0.5]}</code> will result in a element
     * double the size in X direction and half the size in Y direction.
     * The values can be either singular, which means a single value will
     * be added to the CSS. If you give an array, the values will be join to
     * a string.
     * 3d suffixed properties will be taken for translate and scale if they are
     * available and an array with three values is given.
     * Make sure your browser supports all transformations you apply.
     *
     * @param el {Element} The element to apply the transformation.
     * @param transforms {Map} The map containing the transforms and value.
     */
    transform : function(el, transforms) {
      var transformCss = this.getTransformValue(transforms);
      if (this.__cssKeys != null) {
        var style = this.__cssKeys["name"];
        el.style[style] = transformCss;
      }
    },


    /**
     * Translates the given element by the given value. For further details, take
     * a look at the {@link #transform} method.
     * @param el {Element} The element to apply the transformation.
     * @param value {String|Array} The value to translate e.g. <code>"10px"</code>.
     */
    translate : function(el, value) {
      this.transform(el, {translate: value});
    },


    /**
     * Scales the given element by the given value. For further details, take
     * a look at the {@link #transform} method.
     * @param el {Element} The element to apply the transformation.
     * @param value {Number|Array} The value to scale.
     */
    scale : function(el, value) {
      this.transform(el, {scale: value});
    },


    /**
     * Rotates the given element by the given value. For further details, take
     * a look at the {@link #transform} method.
     * @param el {Element} The element to apply the transformation.
     * @param value {String|Array} The value to rotate e.g. <code>"90deg"</code>.
     */
    rotate : function(el, value) {
      this.transform(el, {rotate: value});
    },


    /**
     * Skews the given element by the given value. For further details, take
     * a look at the {@link #transform} method.
     * @param el {Element} The element to apply the transformation.
     * @param value {String|Array} The value to skew e.g. <code>"90deg"</code>.
     */
    skew : function(el, value) {
      this.transform(el, {skew: value});
    },


    /**
     * Converts the given map to a string which could be added to a css
     * stylesheet.
     * @param transforms {Map} The transforms map. For a detailed description,
     * take a look at the {@link #transform} method.
     * @return {String} The CSS value.
     */
    getCss : function(transforms) {
      var transformCss = this.getTransformValue(transforms);
      if (this.__cssKeys != null) {
        var style = this.__cssKeys["name"];
        return qx.bom.Style.getCssName(style) + ":" + transformCss + ";";
      }
      return "";
    },


    /**
     * Sets the transform-origin property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
     * @param el {Element} The dom element to set the property.
     * @param value {String} CSS position values like <code>50% 50%</code> or
     *   <code>left top</code>.
     */
    setOrigin : function(el, value) {
      if (this.__cssKeys != null) {
        el.style[this.__cssKeys["origin"]] = value;
      }
    },


    /**
     * Returns the transform-origin property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
     * @param el {Element} The dom element to read the property.
     * @return {String} The set property, e.g. <code>50% 50%</code>
     */
    getOrigin : function(el) {
      if (this.__cssKeys != null) {
        return el.style[this.__cssKeys["origin"]];
      }
      return "";
    },


    /**
     * Sets the transform-style property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
     * @param el {Element} The dom element to set the property.
     * @param value {String} Either <code>flat</code> or <code>preserve-3d</code>.
     */
    setStyle : function(el, value) {
      if (this.__cssKeys != null) {
        el.style[this.__cssKeys["style"]] = value;
      }
    },


    /**
     * Returns the transform-style property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
     * @param el {Element} The dom element to read the property.
     * @return {String} The set property, either <code>flat</code> or
     *   <code>preserve-3d</code>.
     */
    getStyle : function(el) {
      if (this.__cssKeys != null) {
        return el.style[this.__cssKeys["style"]];
      }
      return "";
    },


    /**
     * Sets the perspective property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
     * @param el {Element} The dom element to set the property.
     * @param value {Number} The perspective layer. Numbers between 100
     *   and 5000 give the best results.
     */
    setPerspective : function(el, value) {
      if (this.__cssKeys != null) {
        el.style[this.__cssKeys["perspective"]] = value + "px";
      }
    },


    /**
     * Returns the perspective property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
     * @param el {Element} The dom element to read the property.
     * @return {String} The set property, e.g. <code>500</code>
     */
    getPerspective : function(el) {
      if (this.__cssKeys != null) {
        return el.style[this.__cssKeys["perspective"]];
      }
      return "";
    },


    /**
     * Sets the perspective-origin property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
     * @param el {Element} The dom element to set the property.
     * @param value {String} CSS position values like <code>50% 50%</code> or
     *   <code>left top</code>.
     */
    setPerspectiveOrigin : function(el, value) {
      if (this.__cssKeys != null) {
        el.style[this.__cssKeys["perspective-origin"]] = value;
      }
    },


    /**
     * Returns the perspective-origin property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
     * @param el {Element} The dom element to read the property.
     * @return {String} The set property, e.g. <code>50% 50%</code>
     */
    getPerspectiveOrigin : function(el) {
      if (this.__cssKeys != null) {
        var value = el.style[this.__cssKeys["perspective-origin"]];
        if (value != "") {
          return value;
        } else {
          var valueX = el.style[this.__cssKeys["perspective-origin"] + "X"];
          var valueY = el.style[this.__cssKeys["perspective-origin"] + "Y"];
          if (valueX != "") {
            return valueX + " " + valueY;
          }
        }
      }
      return "";
    },


    /**
     * Sets the backface-visibility property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
     * @param el {Element} The dom element to set the property.
     * @param value {Boolean} <code>true</code> if the backface should be visible.
     */
    setBackfaceVisibility : function(el, value) {
      if (this.__cssKeys != null) {
        el.style[this.__cssKeys["backface-visibility"]] = value ? "visible" : "hidden";
      }
    },


    /**
     * Returns the backface-visibility property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
     * @param el {Element} The dom element to read the property.
     * @return {Boolean} <code>true</code>, if the backface is visible.
     */
    getBackfaceVisibility : function(el) {
      if (this.__cssKeys != null) {
        return el.style[this.__cssKeys["backface-visibility"]] == "visible";
      }
      return true;
    },


    /**
     * Converts the given transforms map to a valid CSS string.
     *
     * @param transforms {Map} A map containing the transforms.
     * @return {String} The CSS transforms.
     */
    getTransformValue : function(transforms) {
      var value = "";
      var properties3d = ["translate", "scale"];

      for (var property in transforms) {
        var params = transforms[property];

        // if an array is given
        if (qx.Bootstrap.isArray(params)) {
          // use 3d properties for translate and scale if all 3 parameter are given
          if (params.length === 3 &&
            properties3d.indexOf(property) > -1 &&
            qx.core.Environment.get("css.transform.3d")
          ) {
            value += this._compute3dProperty(property, params);
          }

          // use axis related properties
          else {
            value += this._computeAxisProperties(property, params);
          }

        // case for single values given
        } else {
          // single value case
          value += property + "(" + params + ") ";
        }
      }

      return value.trim();
    },


    /**
     * Helper function to create 3d property.
     *
     * @param property {String} Property of transform, e.g. translate
     * @param params {Array} Array with three values, each one stands for an axis.
     *
     * @return {String} Computed property and its value
     */
    _compute3dProperty : function(property, params)
    {
      var cssValue = "";
      property += "3d";

      for (var i=0; i < params.length; i++) {
        if (params[i] == null) {
          params[i] = 0;
        }
      }

      cssValue += property + "(" + params.join(", ") + ") ";

      return cssValue;
    },


    /**
     * Helper function to create axis related properties.
     *
     * @param property {String} Property of transform, e.g. rotate
     * @param params {Array} Array with values, each one stands for an axis.
     *
     * @return {String} Computed property and its value
     */
    _computeAxisProperties : function(property, params)
    {
      var value = "";
      var dimensions = ["X", "Y", "Z"];
      for (var i=0; i < params.length; i++) {
        if (params[i] == null ||
          (i == 2 && !qx.core.Environment.get("css.transform.3d"))) {
          continue;
        }
        value += property + dimensions[i] + "(";
        value += params[i];
        value += ") ";
      }

      return value;
    }
  }
});
