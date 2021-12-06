/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.mobile.form.Form",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {

    __username : null,

    testValidation : function()
    {
      var form = this.__createForm();
      var renderer = new qx.ui.mobile.form.renderer.Single(form);
      this.getRoot().add(renderer);
      this.assertFalse(form.validate());

      this.assertEquals(2, renderer._getChildren()[1].getChildren().length);
      this.assertTrue(qx.bom.element.Class.has(renderer._getChildren()[1].getChildren()[1].getContainerElement(), 'invalid'));

      this.__username.setValue('myusername');
      this.assertTrue(form.validate());
      this.assertEquals(2, renderer._getChildren()[1].getChildren().length);
      this.assertFalse(qx.bom.element.Class.has(renderer._getChildren()[1]._getChildren()[1].getContainerElement(), 'invalid'));

      this.__username.dispose();
      renderer.dispose();
      form.dispose();
    },

    __createForm : function()
    {
      var form = new qx.ui.mobile.form.Form();
      var validationManager = form.getValidationManager();

      var username = this.__username = new qx.ui.mobile.form.TextField().set({placeholder:"Username"});
      username.setRequired(true);
      form.add(username, "Username: ");
      validationManager.add(username, function(value, item){
        var valid = value != null && value.length>3;
        if(!valid) {
          item.setInvalidMessage("username should have more than 3 characters!");
        }
        return valid;
      }, this);

      return form;
    }

  }
});
