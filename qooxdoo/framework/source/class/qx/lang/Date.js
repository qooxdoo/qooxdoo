/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Sebastian Werner, http://sebastian-werner.net

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code based on the following work:

   * jQuery
     http://jquery.com
     Version 1.3.1

     Copyright:
       2009 John Resig

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/**
 * Helper functions for dates.
 *
 * The native JavaScript Date is not modified by this class.
 */
qx.Bootstrap.define("qx.lang.Date",
{
  statics :
  {
    /**
     * Returns the current time
     *
     * @return {Integer} Time in ms from 1970.
     */
    now : function() {
      return +new Date;
    }
  }
});
