/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Manager", 
{
  extend : qx.test.ui.LayoutTestCase,
  
  construct : function() {
    this.base(arguments);
  },

  members :
  {
    __username : null,
    __password1 : null,
    __password2 : null,
    __manager : null,
    
    setUp: function() {
      this.__username = new qx.ui.form.TextField();
      this.__password1 = new qx.ui.form.TextField();
      this.__password2 = new qx.ui.form.TextField();    
      this.__manager = new qx.ui.form.Manager();
    },
      
    tearDown: function() {
      this.__manager.dispose();
      this.__username.dispose();
      this.__password1.dispose();
      this.__password2.dispose();
    },
    
    
    // validator
    __notEmptyValidator : function(value, formItem) 
    {
      var isString = qx.lang.Type.isString(value);
      var valid = isString && value.length > 0;
      valid ? formItem.setInvalidMessage("") : formItem.setInvalidMessage("fail");
      return valid;
    },   
    
    __notEmptyValidatorError : function(value) 
    {
      var isString = qx.lang.Type.isString(value);
      if (!isString || value.length == 0) {
        throw new qx.core.ValidationError("fail");
      }
    },     
    
    
    
    // testSyncSelfContained ///////////////
    testSyncSelfContained1NotNull: function() {
      this.__manager.add(this.__username, null, this.__notEmptyValidator);
      
      // validate = fail (no text entered)
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__manager.getValid());      
      this.assertFalse(this.__username.getValid());  
      
      // check the invalid messages
      this.assertEquals("fail", this.__username.getInvalidMessage());
      this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);          
      
      // enter text in the usernamen
      this.__username.setValue("affe");
      
      // validate last time = true
      this.assertTrue(this.__manager.validate());
      this.assertTrue(this.__manager.getValid());      
      this.assertTrue(this.__username.getValid());      
    },
    
    
    testSyncSelfContained1NotNullEvents: function(attributes) {
      this.__manager.add(this.__username, null, this.__notEmptyValidator);

      var self = this;
      this.assertEventFired(this.__manager, "changeValid", function() {
        self.__manager.validate();
      }, function(e) {
        self.assertFalse(e.getData());
        self.assertNull(e.getOldData());
      });
      
      // make the form valid
      this.__username.setValue("affe");
      
      this.assertEventFired(this.__manager, "changeValid", function() {
        self.__manager.validate();
      }, function(e) {
        self.assertTrue(e.getData());
        self.assertFalse(e.getOldData());
      });      
    },
    
    
    __testSyncSelfContained3NotNull: function(validator) {
      this.__manager.add(this.__username, null, validator);
      this.__manager.add(this.__password1, null, validator);
      this.__manager.add(this.__password2, null, validator);
      
      // validate = fail (no text entered)
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__username.getValid());
      this.assertFalse(this.__password1.getValid());
      this.assertFalse(this.__password2.getValid());
      
      // check the invalid messages
      this.assertEquals("fail", this.__username.getInvalidMessage());      
      this.assertEquals("fail", this.__password1.getInvalidMessage());
      this.assertEquals("fail", this.__password2.getInvalidMessage());
      this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);
      this.assertEquals("fail", this.__manager.getInvalidMessages()[1]);
      this.assertEquals("fail", this.__manager.getInvalidMessages()[2]);
      this.assertEquals(3, this.__manager.getInvalidMessages().length);      
      
      // enter text to the two passwordfields
      this.__password1.setValue("1");
      this.__password2.setValue("2");
      
      // validate again = fail (username empty)
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__username.getValid());
      this.assertTrue(this.__password1.getValid());
      this.assertTrue(this.__password2.getValid());      
      
      // check the invalid messages
      this.assertEquals("fail", this.__username.getInvalidMessage());      
      this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);
      this.assertEquals(1, this.__manager.getInvalidMessages().length);      
      
      
      // enter text in the usernamen
      this.__username.setValue("affe");
      
      // validate last time = true
      this.assertTrue(this.__manager.validate());
      this.assertTrue(this.__username.getValid());
      this.assertTrue(this.__password1.getValid());
      this.assertTrue(this.__password2.getValid());    
      
      this.assertEquals(0, this.__manager.getInvalidMessages().length);
    },
    
    
    testSyncSelfContained3NotNull : function() {
      this.__testSyncSelfContained3NotNull(this.__notEmptyValidator);
    },
    
    
    testSyncSelfContained3NotNullError : function() {
      this.__testSyncSelfContained3NotNull(this.__notEmptyValidatorError);      
    },
    
    // //////////////////////////////
      
      
    // testSyncRelated
    
    __testSyncRelatedNoIndividual: function(validator) {
      this.__manager.add(this.__username);
      this.__manager.add(this.__password1);
      this.__manager.add(this.__password2);
      
      this.__password1.setValue("affe");
      
      this.__manager.setValidator(validator);
      
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__manager.getValid());

      this.assertEquals("fail", this.__manager.getInvalidMessage());
      this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);

      this.__password2.setValue("affe");
      
      this.assertTrue(this.__manager.validate());
      this.assertTrue(this.__manager.getValid());

      this.assertEquals(0, this.__manager.getInvalidMessages().length);      
    },
    
    
    testSyncRelatedNoIndividual : function() {
      this.__testSyncRelatedNoIndividual(function(formItems, manager) {
        var valid = formItems[1].getValue() == formItems[2].getValue();
        if (!valid) {
          manager.setInvalidMessage("fail");
        }
        return valid;
      });
    },
    
    
    testSyncRelatedNoIndividualError : function() {
      this.__testSyncRelatedNoIndividual(function(formItems, manager) {
        if (formItems[1].getValue() != formItems[2].getValue()) {
          throw new qx.core.ValidationError("fail");
        }
      });
    },
    
    
    testSyncRelatedWithIndividual: function() {
      this.__manager.add(this.__username, null, this.__notEmptyValidator);
      this.__manager.add(this.__password1, null, this.__notEmptyValidator);
      this.__manager.add(this.__password2, null, this.__notEmptyValidator);
      
      this.__password1.setValue("affe");
      
      this.__manager.setValidator(function(formItems, manager) {
        var valid = formItems[1].getValue() == formItems[2].getValue();
        if (!valid) {
          manager.setInvalidMessage("fail");
        }
        return valid;
      });
      
      // false: username and password2 empty && password 1 != password2
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__manager.getValid());
      this.assertFalse(this.__username.getValid());
      this.assertFalse(this.__password2.getValid());

      var messages = this.__manager.getInvalidMessages();
      this.assertEquals("fail", this.__manager.getInvalidMessage());
      this.assertEquals("fail", messages[0]);
      this.assertEquals("fail", messages[1]);
      this.assertEquals("fail", messages[2]);
      this.assertEquals(3, messages.length);


      this.__password2.setValue("affe");

      // fail: username empty
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__manager.getValid());
      this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);
      this.assertEquals(1, this.__manager.getInvalidMessages().length);

      this.__username.setValue("user");
      
      // ok
      this.assertTrue(this.__manager.validate());
      this.assertTrue(this.__manager.getValid());
      this.assertEquals(0, this.__manager.getInvalidMessages().length);
      this.assertTrue(this.__username.getValid());
      this.assertTrue(this.__password1.getValid());
      this.assertTrue(this.__password2.getValid());            
    }  
  }
});
