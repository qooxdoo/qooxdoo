/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Andreas Ecker (ecker)
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#require(qx.dev.log.Appender)
#use(qx.constant.Type)

************************************************************************ */

/**
 * An appender that writes each message to a native alert().
 * <p>
 * This class does not depend on qooxdoo widgets, so it also works when there
 * are problems with widgets or when the widgets are not yet initialized.
 */
qx.OO.defineClass("qx.dev.log.AlertAppender", qx.dev.log.Appender,
function() {
  qx.dev.log.Appender.call(this);
});


// overridden
qx.OO.changeProperty({ name:"useLongFormat", type:qx.constant.Type.BOOLEAN, defaultValue:false, allowNull:false });

// overridden
qx.Proto.appendLogEvent = function(evt) {

  // Append the message
  var text = evt.logger.getName();
  if (evt.instanceId != null) {
     text += " (" + evt.instanceId + ")";
  }

  alert("\n" + text + "\n" + this.formatLogEvent(evt));
}


// overridden
qx.Proto.dispose = function() {
  if (this.getDisposed()) {
      return true;
  }

  return qx.dev.log.Appender.prototype.dispose.call(this);
}
