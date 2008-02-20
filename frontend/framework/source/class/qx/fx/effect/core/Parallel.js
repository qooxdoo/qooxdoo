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
   * @param effects {Array} List of effects
   */
  construct : function(effects)
  {
    this.base(arguments);
    this._effects = effects;
  },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

   members :
   {

    finish : function(position)
    {
      this.base(arguments);

      var effects = this._effects;

      for(var i=0; i<effects.length; i++)
      {
        effects[i].render(1.0);
        effects[i].cancel();

        effects[i].beforeFinishInternal();
        effects[i].beforeFinish();

        effects[i].finish(position);

        effects[i].afterFinishInternal();
        effects[i].afterFinish();
      }
    },


    update : function(position)
    {
      this.base(arguments);

      var effects = this._effects;

      for (var i=0; i<effects.length; i++) {
        effects[i].render(position);
      }
    },


    start : function()
    {
      this.base(arguments);

      var effects = this._effects;

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
     this._disposeArray("_effects");
   }
});
