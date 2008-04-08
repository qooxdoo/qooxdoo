/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Each object, which should be managed by a {@link RadioManager} have to
 * implement this interface.
 *
 * Each time the {@link #checked} property changes, the item should inform the
 * connected radio manager by calling the method
 * {@link RadioManager#setItemChecked}.
 */
qx.Interface.define("qx.ui.core.IRadioItem",
{
  properties :
  {
    /** Whether the item is enabled */
    enabled : {
      check : "Boolean"
    },

    /** Whether the item is currently checked */
    checked : {
      check : "Boolean"
    },

    /** The radio manager, which manages this item */
    manager : {
      check : "qx.ui.core.RadioManager"
    }
  }
});
