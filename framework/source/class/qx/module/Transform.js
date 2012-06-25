/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * This class is responsible for applying CSS3 transforms to the collection.
 * The implementation is mostly a cross browser wrapper for applying the
 * transforms.
 * The API is keep to the spec as close as possible.
 *
 * http://www.w3.org/TR/css3-3d-transforms/
 */
qx.Bootstrap.define("qx.module.Transform",
{
  statics :
  {
    /**
     * Method to apply multiple transforms at once to the given element. It
     * takes a map containing the transforms you want to apply plus the values
     * e.g.<code>{scale: 2, rotate: "5deg"}</code>.
     * The values can be either singular, which means a single value will
     * be added to the CSS. If you give an array, the values will be split up
     * and each array entry will be used for the X, Y or Z dimension in that
     * order e.g. <code>{scale: [2, 0.5]}</code> will result in a element
     * double the size in X direction and half the size in Y direction.
     * Make sure your browser supports all transformations you apply.
     *
     * @attach {q}
     * @param transforms {Map} The map containing the transforms and value.
     * @return {q} This reference for chaining.
     */
    transform : function(transforms) {
      this.forEach(function(el) {
        qx.bom.element.Transform.transform(el, transforms);
      })
    },


    /**
     * Translates by the given value. For further details, take
     * a look at the {@link #transform} method.
     *
     * @attach {q}
     * @param value {String|Array} The value to translate e.g. <code>"10px"</code>.
     * @return {q} This reference for chaining.
     */
    translate : function(value) {
      return this.transform({translate: value});
    },


    /**
     * Scales by the given value. For further details, take
     * a look at the {@link #transform} method.
     *
     * @attach {q}
     * @param value {Number|Array} The value to scale.
     * @return {q} This reference for chaining.
     */
    scale : function(value) {
      return this.transform({scale: value});
    },


    /**
     * Rotates by the given value. For further details, take
     * a look at the {@link #transform} method.
     * @param value {String|Array} The value to rotate e.g. <code>"90deg"</code>.
     * @return {q} This reference for chaining.
     */
    rotate : function(value) {
      return this.transform({rotate: value});
    },


    /**
     * Skews by the given value. For further details, take
     * a look at the {@link #transform} method.
     *
     * @attach {q}
     * @param value {String|Array} The value to skew e.g. <code>"90deg"</code>.
     * @return {q} This reference for chaining.
     */
    skew : function(value) {
      return this.transform({skew: value});
    },


    /**
     * Sets the transform-origin property.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
     *
     * @attach {q}
     * @param value {String} CSS position values like <code>50% 50%</code> or
     *   <code>left top</code>.
     * @return {q} This reference for chaining.
     */
    setTransformOrigin : function(value) {
      this.forEach(function(el) {
        qx.bom.element.Transform.setOrigin(el, value);
      });
      return this;
    },


    /**
     * Returns the transform-origin property of the first element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
     *
     * @attach {q}
     * @return {String} The set property, e.g. <code>50% 50%</code> or null,
     *   of the collection is empty.
     */
    getTransformOrigin : function() {
      if (this[0]) {
        return qx.bom.element.Transform.getOrigin(this[0]);
      }
      return "";
    },


    /**
     * Sets the transform-style property.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
     *
     * @attach {q}
     * @param value {String} Either <code>flat</code> or <code>preserve-3d</code>.
     * @return {q} This reference for chaining.
     */
    setTransformStyle : function(value) {
      this.forEach(function(el) {
        qx.bom.element.Transform.setStyle(el, value);
      });
      return this;
    },


    /**
     * Returns the transform-style property of the first element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
     *
     * @attach {q}
     * @return {String} The set property, either <code>flat</code> or
     *   <code>preserve-3d</code>.
     */
    getTransformStyle : function() {
      if (this[0]) {
        return qx.bom.element.Transform.getStyle(this[0]);
      }
      return "";
    },


    /**
     * Sets the perspective property.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
     *
     * @attach {q}
     * @param value {Number} The perspective layer. Numbers between 100
     *   and 5000 give the best results.
     * @return {q} This reference for chaining.
     */
    setTransformPerspective : function(value) {
      this.forEach(function(el) {
        qx.bom.element.Transform.setPerspective(el, value);
      });
      return this;
    },


    /**
     * Returns the perspective property of the first element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
     *
     * @attach {q}
     * @return {String} The set property, e.g. <code>500</code>
     */
    getTransformPerspective : function() {
      if (this[0]) {
        return qx.bom.element.Transform.getPerspective(this[0]);
      }
      return "";
    },


    /**
     * Sets the perspective-origin property.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
     *
     * @attach {q}
     * @param value {String} CSS position values like <code>50% 50%</code> or
     *   <code>left top</code>.
     * @return {q} This reference for chaining.
     */
    setTransformPerspectiveOrigin : function(value) {
      this.forEach(function(el) {
        qx.bom.element.Transform.setPerspectiveOrigin(el, value);
      });
      return this;
    },


    /**
     * Returns the perspective-origin property of the first element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
     *
     * @attach {q}
     * @return {String} The set property, e.g. <code>50% 50%</code>
     */
    getTransformPerspectiveOrigin : function() {
      if (this[0]) {
        return qx.bom.element.Transform.getPerspectiveOrigin(this[0]);
      }
      return "";
    },


    /**
     * Sets the backface-visibility property.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
     *
     * @attach {q}
     * @param value {Boolean} <code>true</code> if the backface should be visible.
     * @return {q} This reference for chaining.
     */
    setTransformBackfaceVisibility : function(value) {
      this.forEach(function(el) {
        qx.bom.element.Transform.setBackfaceVisibility(el, value);
      });
      return this;
    },


    /**
     * Returns the backface-visibility property of the first element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
     *
     * @attach {q}
     * @return {Boolean} <code>true</code>, if the backface is visible.
     */
    getTransformBackfaceVisibility : function() {
      if (this[0]) {
        return qx.bom.element.Transform.getBackfaceVisibility(this[0]);
      }
      return "";
    }
  },


  defer : function(statics) {
    q.$attach({
      "transform" : statics.transform,
      "translate" : statics.translate,
      "rotate" : statics.rotate,
      "skew" : statics.skew,
      "scale" : statics.scale,

      "setTransformStyle" : statics.setTransformStyle,
      "getTransformStyle" : statics.getTransformStyle,
      "setTransformOrigin" : statics.setTransformOrigin,
      "getTransformOrigin" : statics.getTransformOrigin,
      "setTransformPerspective" : statics.setTransformPerspective,
      "getTransformPerspective" : statics.getTransformPerspective,
      "setTransformPerspectiveOrigin" : statics.setTransformPerspectiveOrigin,
      "getTransformPerspectiveOrigin" : statics.getTransformPerspectiveOrigin,
      "setTransformBackfaceVisibility" : statics.setTransformBackfaceVisibility,
      "getTransformBackfaceVisibility" : statics.getTransformBackfaceVisibility
    });
  }
});