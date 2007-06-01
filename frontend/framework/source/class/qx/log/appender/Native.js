/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(core)
#module(log)
#require(qx.log.appender.Window)
#require(qx.log.appender.FireBug)

************************************************************************ */

/**
 * An appender that writes all messages to the best possible target in
 * this client e.g. it uses Firebug in Firefox browsers.
 */
qx.Class.define("qx.log.appender.Native",
{
  extend : qx.log.appender.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    if (typeof console != 'undefined' && console.debug && !console.emu) {
      this._appender = new qx.log.appender.FireBug;
    } else {
      this._appender = new qx.log.appender.Window;
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    // overridden
    appendLogEvent : function(evt)
    {
      if (this._appender) {
        return this._appender.appendLogEvent(evt);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_appender");
  }
});
