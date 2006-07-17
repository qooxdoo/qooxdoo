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

#require(qx.dev.log.Filter)
#use(qx.constant.Type)

************************************************************************ */

/**
 * The default filter. Has a minimum level and can be enabled or disabled.
 */
qx.OO.defineClass("qx.dev.log.DefaultFilter", qx.dev.log.Filter,
function() {
  qx.dev.log.Filter.call(this);
});


/**
 * Whether the filter should be enabled. If set to false all log events
 * will be denied.
 */
qx.OO.addProperty({ name:"enabled", type:qx.constant.Type.BOOLEAN, defaultValue:true, allowNull:false, getAlias:"isEnabled" });

/**
 * The minimum log level. If set only log messages with a level greater or equal
 * to the set level will be accepted.
 */
qx.OO.addProperty({ name:"minLevel", type:qx.constant.Type.NUMBER, defaultValue:null });


// overridden
qx.Proto.decide = function(evt) {
  var Filter = qx.dev.log.Filter;
  if (! this.isEnabled()) {
    return Filter.DENY;
  } else if (this.getMinLevel() == null) {
    return Filter.NEUTRAL;
  } else {
    return (evt.level >= this.getMinLevel()) ? Filter.ACCEPT : Filter.DENY;
  }
}
