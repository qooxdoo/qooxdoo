/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This mixin offers basic event handling capabilities. It includes the
 * commonly known methods for managing event listeners and firing events.
 *
 * @deprecated {2.1} Renamed to MEvent
 */
qx.Mixin.define("qx.core.MEvents",
{
  include : [qx.core.MEvent]
});
if (qx.core.Environment.get("qx.debug")) {
  qx.log.Logger.deprecatedMixinWarning(
    qx.core.MEvents,
    "It has been renamed to MEvent"
  );
}