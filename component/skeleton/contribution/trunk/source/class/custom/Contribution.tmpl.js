/* ************************************************************************

   Copyright:
     2009 ACME Corporation -or- Your Name, http://www.example.com
     
   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Your Name (username)

************************************************************************ */

/* ************************************************************************

#asset(${NamespacePath}/*)

************************************************************************ */

/**
 * This is the main class of contribution "${Name}"
 * 
 * TODO: Replace the sample code of a custom button with the actual code of 
 * your contribution.
 */
qx.Class.define("${Namespace}.Contribution",
{
  extend : qx.ui.form.Button,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new custom button
   * 
   * @param label {String} Label to use
   * @param icon {String?null} Icon to use
   */
  construct : function(label, icon) 
  {
    this.base(arguments, label.toUpperCase(), icon);
  }
});
