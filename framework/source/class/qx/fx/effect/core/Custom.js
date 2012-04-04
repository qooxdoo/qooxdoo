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
 * A "empty" effect based on Base which executes the given function to
 * performe animation.
 * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
 */
qx.Class.define("qx.fx.effect.core.Custom",
{

  extend : qx.fx.Base,

  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  /**
   * @param element {Object} The DOM element
   * @param func {Function} Function to be execute when update() is called.
   * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
   */
  construct : function(element, func)
  {
    if (qx.core.Environment.get("qx.debug")) {
      this.assertFunction(func);
    }
    this.__func = func;

    this.base(arguments, element);
  },


  members :
  {
    __func : null,

    // overridden
    update : function(position)
    {
      this.base(arguments);
      this.__func(this, position);
    }

  }


});
