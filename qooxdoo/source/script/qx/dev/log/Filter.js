/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>
     * Til Schneider (til132)
       <tilman dot schneider at stz-ida dot de>

************************************************************************ */

/* ************************************************************************

#require(qx.core.Object)

************************************************************************ */

/**
 * A filter for log events.
 */
qx.OO.defineClass("qx.dev.log.Filter", qx.core.Object,
function() {
  qx.core.Object.call(this);
});

/**
 * Decidies whether a log event is accepted.
 *
 * @param evt {Map} The event to check.
 * @return {int} {@link #ACCEPT}, {@link #DENY} or {@link #NEUTRAL}.
 */
qx.Proto.decide = function(evt) {
  throw new Error("decide is abstract");
}


/** {int} Specifies that the log event is accepted. */
qx.Class.ACCEPT = 1;

/** {int} Specifies that the log event is denied. */
qx.Class.DENY = 2;

/** {int} Specifies that the filter is neutral to the log event. */
qx.Class.NEUTRAL = 3;
