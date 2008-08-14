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
 * several effects running synchronized.
 */
qx.Class.define("qx.fx.effect.core.Parallel",
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

     __effects : null,

    /**
     * Finishes all child effects
     */
    finish : function()
    {
      this.base(arguments);

      var effects = this.__effects;

      for(var i=0; i<effects.length; i++)
      {
        effects[i].render(1.0);
        effects[i].cancel();

        effects[i].beforeFinishInternal();
        effects[i].beforeFinish();

        effects[i].finish(1.0);

        effects[i].afterFinishInternal();
        effects[i].afterFinish();
      }
    },

    /**
     * Renders all child effects
     *
     * @param position {Number} Animation setp
     * as Number between 0 and 1.
     */
    update : function(position)
    {
      this.base(arguments);

      var effects = this.__effects;

      for (var i=0; i<effects.length; i++) {
        effects[i].render(position);
      }
    },


    start : function()
    {
      if (!this.base(arguments)) {
        return;
      }

      var effects = this.__effects;

      for (var i=0; i<effects.length; i++) {
        effects[i].start();
      }
    }

   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this._disposeArray("__effects");
   }
});
