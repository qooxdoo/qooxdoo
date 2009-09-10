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

/**
 * A filter for log events.
 */
qx.Class.define("qx.legacy.log.Filter",
{
  extend : qx.core.Object,
  type : "abstract",




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
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {int} Specifies that the log event is accepted. */
    ACCEPT  : 1,

    /** {int} Specifies that the log event is denied. */
    DENY    : 2,

    /** {int} Specifies that the filter is neutral to the log event. */
    NEUTRAL : 3
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Decidies whether a log event is accepted.
     *
     * @abstract
     * @param evt {Map} The event to check.
     * @return {Integer} {@link #ACCEPT}, {@link #DENY} or {@link #NEUTRAL}.
     * @throws the abstract function warning.
     */
    decide : function(evt) {
      throw new Error("decide is abstract");
    }
  }
});
