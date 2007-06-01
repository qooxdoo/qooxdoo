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
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(log)

************************************************************************ */

/**
 * An appender that forwards all log events to a log event processor.
 */
qx.Class.define("qx.log.appender.Forward",
{
  extend : qx.log.appender.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param targetProcessor {LogEventProcessor} The log event processor Where to
   *    pass the log events.
   */
  construct : function(targetProcessor)
  {
    this.base(arguments);

    this._targetProcessor = targetProcessor;
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    appendLogEvent : function(evt) {
      this._targetProcessor.handleLogEvent(evt);
    }
  }
});
