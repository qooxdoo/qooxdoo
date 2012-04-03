/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

   ======================================================================

   This class contains code based on the following work:

   * script.aculo.us
       http://script.aculo.us/
       Version 1.8.1

     Copyright:
       (c) 2008 Thomas Fuchs

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Author:
       Thomas Fuchs

************************************************************************ */

/**
 * A simple effect which changes the given CSS attribute during the
 * duration of the animation. A function can be given to modify the
 * incoming numeric value.
 * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
 */

qx.Class.define("qx.fx.effect.core.Style",
{

  extend : qx.fx.Base,

  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  /**
   * @param element {Object} The DOM element
   * @param cssAttribute {String} Name of the CSS attribute to animate.
   * @param func {Function} Function which modifies the numeric value given by
   * update().
   * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
   */
  construct : function(element, cssAttribute, func)
  {
    if (cssAttribute)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertString(cssAttribute);
      }
      this.__cssAttribute = cssAttribute;
    }else {
      throw new Error("A CSS attribute must be specified!");
    }

    if (func)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertFunction(func);
      }
      this.__func = func;
    }

    this.base(arguments, element);
  },

  members :
  {
    __cssAttribute : null,
    __func : null,

    // overridden
    update : function(position)
    {
      this.base(arguments);
      var value = this.__func ? this.__func(position) : position;

      qx.bom.element.Style.set(this._getElement(), this.__cssAttribute, value)
    }
  }
});
