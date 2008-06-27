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
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qx.ui.groupbox.RadioGroupBox",
{
  extend : qx.ui.groupbox.GroupBox,

  members :
  {
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "legend":
          control = new qx.ui.form.RadioButton;
          control.setChecked(true);
    
          this._add(control);
      }
      
      return control || this.base(arguments, id);
    }
  }
});
