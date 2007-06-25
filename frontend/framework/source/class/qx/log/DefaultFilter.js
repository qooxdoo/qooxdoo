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

#module(core)
#module(log)

************************************************************************ */

/**
 * The default filter. Has a minimum level and can be enabled or disabled.
 */
qx.Class.define("qx.log.DefaultFilter",
{
  extend : qx.log.Filter,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether the filter should be enabled. If set to false all log events
     * will be denied.
     */
    enabled :
    {
      check : "Boolean",
      init : true
    },


    /**
     * The minimum log level. If set only log messages with a level greater or equal
     * to the set level will be accepted.
     */
    minLevel :
    {
      check : "Number",
      nullable : true
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
    /**
     * @return {Integer} TODOC
     */
    decide : function(evt)
    {
      var Filter = qx.log.Filter;

      if (!this.getEnabled()) {
        return Filter.DENY;
      } else if (this.getMinLevel() == null) {
        return Filter.NEUTRAL;
      } else {
        return (evt.level >= this.getMinLevel()) ? Filter.ACCEPT : Filter.DENY;
      }
    }
  }
});
