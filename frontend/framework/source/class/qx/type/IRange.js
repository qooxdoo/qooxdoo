/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * The interface for a range manager
 */
qx.Interface.define("qx.type.IRange",
{
  properties :
  {
    /** current value of the Range object */
    value : { },

    /** minimal value of the Range object */
    min : { },

    /** maximal value of the Range object */
    max : { }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    limit : function(value)
    {
      return true;
    }

    /**
     * OPTIONAL for ranges used by Spinner.  If implemented, this method will
     * be called to increment or decrement the value, rather than simply
     * adding or subtracting 1.
     */
/*
    incrementValue : function(value)
    {
      return true;
    },
*/

    /**
     * OPTIONAL for ranges used by Spinner.  If implemented, this method will
     * be called to increment or decrement the value, rather than simply
     * adding or subtracting 1.  This is just like incrementValue, but is used
     * when the invervalMode is "page".
     */
/*
    pageIncrementValue : function(value)
    {
      return true;
    }
*/
  }
});
