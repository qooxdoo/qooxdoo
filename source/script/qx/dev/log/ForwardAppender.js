/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#require(qx.dev.log.Appender)

************************************************************************ */

/**
 * An appender that forwards all log events to a log event processor.
 *
 * @param targetProcessor {LogEventProcessor} The log event processor Where to
 *    pass the log events.
 */
qx.OO.defineClass("qx.dev.log.ForwardAppender", qx.dev.log.Appender,
function(targetProcessor) {
  qx.dev.log.Appender.call(this);

  this._targetProcessor = targetProcessor;
});


// overridden
qx.Proto.appendLogEvent = function(evt) {
  this._targetProcessor.handleLogEvent(evt);
};
