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
 * TODO
 */
qx.Class.define("qx.fx.Parallel",
{

  extend : qx.fx.Base,
  
  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(effects)
  {
    this.base(arguments);
    this._effects = (qx.util.Validation.isValidObject(effects)) ? effects : [];
  },

  
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
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
      for(var i in this._effects)
      {
        this._effects[i].render(1.0);
        this._effects[i].cancel();
  
        this._effects[i].beforeFinishInternal();
        this._effects[i].beforeFinish();
  
        this._effects[i].finish(position);
  
        this._effects[i].afterFinishInternal();
        this._effects[i].afterFinish();
      }
    },


    update : function(position)
    {
      for (var i in this._effects) {
        this._effects[i].render(position);
      }
    },


    start : function()
    {

      this.base(arguments);

      for (var i in this._effects) {
        this._effects[i].start();
      }

    }

   },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    
  }
});