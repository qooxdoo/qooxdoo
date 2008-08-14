/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Rass (jonathan_rass)

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
 * Helper class for building combination effects with
 * several effects running consecutively.
 */
qx.Class.define("qx.fx.effect.core.Consecutive",
{

  extend : qx.fx.Base,

  /*
   *****************************************************************************
      CONSTRUCTOR
   *****************************************************************************
  */


  /**
   * @param varargs {varargs} List of effects
   */
  construct : function(varargs)
  {
    this.base(arguments);

    this.__effects = arguments;
  },



  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

   members :
   {
     __effects : null
   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this._disposeArray("_effects");
   }
});
