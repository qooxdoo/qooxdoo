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
     * Sebastian Werner

************************************************************************ */

qx.Class.define("demobrowser.demo.core.Property",
{
  extend : qx.application.Native,

  properties :
  {
    testNullable : { nullable : true },
    testInit : { init : 1 },
    testThemeNullable : { themeable : true, nullable : true },
    testThemeInit : { themeable : true, init : "black" },
    
    paddingTop : {nullable:true},
    paddingRight : {nullable:true},
    paddingBottom : {nullable:true},
    paddingLeft : {nullable:true},
    
    testGroup : {
      group : ["paddingTop","paddingRight","paddingBottom","paddingLeft"]
    }
  },

  members :
  {
    main: function()
    {
      this.base(arguments);
      
      this.debug("Test 1: Nullable");
      this.setTestNullable("foo");
      this.resetTestNullable();
      
      this.debug("Test 2: Init Value");
      this.setTestInit(999);
      this.resetTestInit();
      
      this.debug("Test 3: Themed + Nullable");      
      this.setTestThemeNullable("blue");
      this.resetTestThemeNullable();
      this.setThemedTestThemeNullable("yellow");
      this.setTestThemeNullable("red");
      this.resetThemedTestThemeNullable();
      this.resetTestThemeNullable();
      
      this.debug("Test 4: Themed + Init Value");      
      this.setTestThemeInit("blue");
      this.resetTestThemeInit();
      
      this.debug("Test 5: Runtime Value");
      this.setRuntimeTestNullable("runtime");
      this.resetRuntimeTestNullable();
      
      this.debug("Test 6: Groups");
      this.setTestGroup(1,2,3,4);
      
      return;
      this.debug("Test 6: Inheritable");
      var parent = new Child;
      var outer1 = new Child;
      var outer2 = new Child;
      var outer3 = new Child;
      var inner1 = new Child;
      var inner2 = new Child;

      parent.add(outer1);
      outer2.add(inner1);
      outer2.add(inner2);      
      parent.add(outer2);
      parent.add(outer3);
      
      /*
      parent
        - outer1
        - outer2
          - inner1
          - inner2
        - outer3
      */ 
      
      this.debug(" - make parent black");      
      parent.setTestInheritable("black");
      this.debug(" - make outer2 red");
      outer2.setTestInheritable("red");
      this.debug(" - reset parent");
      parent.resetTestInheritable();
      this.debug(" - make parent green");
      parent.setTestInheritable("green");
      this.debug(" - reset outer2");
      outer2.resetTestInheritable();
      this.debug(" - reset parent");
      parent.resetTestInheritable();
      this.debug(" - make outer2 yellow (theme)");
      outer2.setThemedTestInheritable("yellow");
      this.debug(" - make parent black");
      parent.setTestInheritable("black");
      this.debug(" - make outer2 'inherit' (user)");
      outer2.setTestInheritable("inherit");
      this.debug(" - reset outer2 (user)");
      outer2.resetTestInheritable();
      this.debug(" - make outer2 'inherit' (user)");
      outer2.setTestInheritable("inherit");
      this.debug(" - make outer2 red");
      outer2.setTestInheritable("red");
    }
  }
});

qx.Class.define("Child",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);
    this.__children = [];
  },
  
  properties : 
  {
    testInheritable : 
    { 
      inheritable : true, 
      init : "blue",
      themeable : true,
      apply : "_applyTestInheritable"
    }    
  },
  
  members : 
  {
    _applyTestInheritable : function(value) {
      //this.debug("Value: " + value);  
    },
    
    _getChildren : function() {
      return this.__children;
    },
    
    add : function(item) {
      this.__children.push(item);
    }    
  }
});
