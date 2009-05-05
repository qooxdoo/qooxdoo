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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.FormValidation",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      
      var widgets = [];

      // spinner
      widgets.push(new qx.ui.form.Spinner());
      this.getRoot().add(widgets[0], {left: 20, top: 70});
      
      // slider
      widgets.push(new qx.ui.form.Slider());
      widgets[1].setWidth(200);
      this.getRoot().add(widgets[1], {left: 20, top: 100});
      
      // textfield
      widgets.push(new qx.ui.form.TextField());
      this.getRoot().add(widgets[2], {left: 20, top: 130});     
      
      // textarea
      widgets.push(new qx.ui.form.TextArea());
      this.getRoot().add(widgets[3], {left: 20, top: 160});    
      
      // passwordfield
      widgets.push(new qx.ui.form.PasswordField());
      this.getRoot().add(widgets[4], {left: 20, top: 240});        
      
      // combobox
      widgets.push(new qx.ui.form.ComboBox());
      this.getRoot().add(widgets[5], {left: 20, top: 270}); 
      
      // selectbox
      widgets.push(new qx.ui.form.SelectBox());
      this.getRoot().add(widgets[6], {left: 20, top: 300});           
      
      /* ***********************************************
       * CONTROLLS
       * ********************************************* */      
      var toggleValidButton = new qx.ui.form.ToggleButton("invalid");
      this.getRoot().add(toggleValidButton, {left: 250, top: 70});
      
      toggleValidButton.addListener("changeChecked", function(e) {
        for (var i = 0; i < widgets.length; i++) {
          widgets[i].setInvalidMessage("Invalid...");
          widgets[i].setValid(!e.getData()); 
        }
      }, this);
      
      
      
      
      
      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */  
      // List Description
      var listDescription = new qx.ui.basic.Label();
      listDescription.setRich(true);
      listDescription.setWidth(250);
      listDescription.setValue("<b>Validation</b><br/>Press the button to"
        + " invalidate all shown widgets. Try the invalid focus and tooltip.");
      this.getRoot().add(listDescription, {left: 20, top: 10});      
    }
  }
});
