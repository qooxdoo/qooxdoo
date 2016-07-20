/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
 * Christopher Zuendorf (czuendorf)

 ************************************************************************ */

/**
 * Contains all animations which are needed for page transitions on {@link qx.ui.mobile.layout.Card}.
 * Provides a convenience method {@link qx.ui.mobile.layout.CardAnimation#getAnimation} which
 * makes it possibility to resolve the right animation for a pageTransition out of the cardAnimationMap.
 */
qx.Class.define("qx.ui.mobile.layout.CardAnimation",
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);

    this._cardAnimationsMap = {
      "none": null,
      "slide": {
        "in": qx.util.Animation.SLIDE_LEFT_IN,
        "out": qx.util.Animation.SLIDE_LEFT_OUT,
        "reverse": {
          "in": qx.util.Animation.SLIDE_RIGHT_IN,
          "out": qx.util.Animation.SLIDE_RIGHT_OUT
        }
      },
      "fade": {
        "in": qx.util.Animation.FADE_IN,
        "out": qx.util.Animation.FADE_OUT,
        "reverse": {
          "in": qx.util.Animation.FADE_IN,
          "out": qx.util.Animation.FADE_OUT
        }
      },
      "pop": {
        "in": qx.util.Animation.POP_IN,
        "out": qx.util.Animation.POP_OUT,
        "reverse": {
          "in": qx.util.Animation.POP_IN,
          "out": qx.util.Animation.POP_OUT
        }
      },
      "slideup": {
        "in": qx.util.Animation.SLIDE_UP_IN,
        "out": qx.util.Animation.SLIDE_UP_OUT,
        "reverse": {
          "in": qx.util.Animation.SLIDE_DOWN_IN,
          "out": qx.util.Animation.SLIDE_DOWN_OUT
        }
      },
      "flip": {
        "in": qx.util.Animation.FLIP_LEFT_IN,
        "out": qx.util.Animation.FLIP_LEFT_OUT,
        "reverse": {
          "in": qx.util.Animation.FLIP_RIGHT_IN,
          "out": qx.util.Animation.FLIP_RIGHT_OUT
        }
      },
      "swap": {
        "in": qx.util.Animation.SWAP_LEFT_IN,
        "out": qx.util.Animation.SWAP_LEFT_OUT,
        "reverse": {
          "in": qx.util.Animation.SWAP_RIGHT_IN,
          "out": qx.util.Animation.SWAP_RIGHT_OUT
        }
      },
      "cube": {
        "in": qx.util.Animation.CUBE_LEFT_IN,
        "out": qx.util.Animation.CUBE_LEFT_OUT,
        "reverse": {
          "in": qx.util.Animation.CUBE_RIGHT_IN,
          "out": qx.util.Animation.CUBE_RIGHT_OUT
        }
      }
    };
  },


  members :
  {
    _cardAnimationsMap : null,


    /**
    * Returns a map with properties for {@link qx.bom.element.Animation} according to the given input parameters.
    * @param animationName {String} the animation key
    * @param direction {String} the animation direction ("in" | "out")
    * @param reverse {Boolean} flag which indicates whether it is a reverse animation.
    * @return {Map} animation property map, intended for the usage with {@link qx.bom.element.Animation}
    */
    getAnimation : function(animationName, direction, reverse)
    {
      if (qx.core.Environment.get("qx.debug")) {
        if (!reverse) {
          this.assertNotUndefined(this._cardAnimationsMap[animationName], "Animation '" + animationName + "' is not defined.");
          this.assertNotUndefined(this._cardAnimationsMap[animationName][direction], "Animation '" + animationName + " " + direction + "' is not defined.");
        } else {
          this.assertNotUndefined(this._cardAnimationsMap[animationName], "Animation Reverse'" + animationName + "' is not defined.");
          this.assertNotUndefined(this._cardAnimationsMap[animationName]["reverse"], "Animation Reverse'" + animationName + "' is not defined.");
          this.assertNotUndefined(this._cardAnimationsMap[animationName]["reverse"][direction], "Animation Reverse'" + animationName + " " + direction + "' is not defined.");
        }
      }

      var animation = this._cardAnimationsMap[animationName];
      var animationObject = {};

      if (!reverse) {
        animationObject = animation[direction];
      } else {
        animationObject = animation["reverse"][direction];
      }

      return animationObject;
    },


    /**
     * Getter for the cardAnimationsMap.
     * @return {Map} the cardAnimationsMap.
     */
    getMap : function() {
      return this._cardAnimationsMap;
    }
  },


  destruct : function() {
    this._cardAnimationsMap = null;
  }
});
