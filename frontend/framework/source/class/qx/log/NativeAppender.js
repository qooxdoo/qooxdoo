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
#require(qx.log.WindowAppender)
#require(qx.log.FireBugAppender)

************************************************************************ */

/**
 * An appender that writes all messages to the best possible target in
 * this client e.g. it uses Firebug in Firefox browsers.
 */
qx.Class.define("qx.log.NativeAppender",
{
  extend : qx.log.Appender,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(name)
  {
    this.base(arguments);

    if (typeof console != 'undefined' && console.debug) {
      this._appender = new qx.log.FireBugAppender;
    } else {
      this._appender = new qx.log.WindowAppender;
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param evt {Event} TODOC
     * @return {var} TODOC
     */
    appendLogEvent : function(evt) {
      return this._appender.appendLogEvent(evt);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      if (this._appender)
      {
        this._appender.dispose();
        this._appender = null;
      }

      return this.base(arguments);
    }
  }
});
