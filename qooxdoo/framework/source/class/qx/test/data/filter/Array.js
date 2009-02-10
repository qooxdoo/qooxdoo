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
qx.Class.define("qx.test.data.filter.Array", 
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function()
    {
      this.__model = new qx.data.Array("A", "B", "C", "D", "E", "F", "G");
      // create the filter rule
      var rule = function(data) {
        if (data == "A" || data == "B" || data == "C") {
          return true;
        }
        return false;
      }
      // create the filter
      this.__filter = new qx.data.filter.Array(this.__model, rule);      
    },


    tearDown : function()
    {
      this.__filter.dispose();
      this.__model.dispose();
    },
        
    
    testStringFilter: function() {            
      // check if the filter contains the new items
      this.assertTrue(this.__filter.contains("A"), "Filter does not work!");
      this.assertTrue(this.__filter.contains("B"), "Filter does not work!");
      this.assertTrue(this.__filter.contains("C"), "Filter does not work!");
      
      // check the length
      this.assertEquals(3, this.__filter.length, "Too much elements in the data.");
    },
    
    
    testChangeModel: function() {
      var newArray = new qx.data.Array("B", "C", "D", "E");
      
      // set the new model
      this.__filter.setModel(newArray);
      
      // check if the filter contains the new items
      this.assertTrue(this.__filter.contains("B"), "Filter does not work!");
      this.assertTrue(this.__filter.contains("C"), "Filter does not work!");
      
      // check the length
      this.assertEquals(2, this.__filter.length, "Too much elements in the data.");
      
      newArray.dispose();
    },
    
    
    testChangeModelOrder: function() {
      this.__model.reverse();

      // check if the filter contains the new items
      this.assertTrue(this.__filter.contains("A"), "Filter does not work!");
      this.assertTrue(this.__filter.contains("B"), "Filter does not work!");
      this.assertTrue(this.__filter.contains("C"), "Filter does not work!");
      
      // check the length
      this.assertEquals(3, this.__filter.length, "Too much elements in the data.");      
    },
    
    
    testChangeModelLength: function() {
      this.__model.shift();

      // check if the filter contains the new items
      this.assertTrue(this.__filter.contains("B"), "Filter does not work!");
      this.assertTrue(this.__filter.contains("C"), "Filter does not work!");
      
      // check the length
      this.assertEquals(2, this.__filter.length, "Too much elements in the data.");      
    },
    
    
    testChangeRule: function() {
      // change the rule
      var rule = function(data) {
        if (data == "D" || data == "E" || data == "F" || data == "G") {
          return true;
        }
        return false;
      }    
      this.__filter.setRule(rule);  
        
        
      // check if the filter contains the new items
      this.assertTrue(this.__filter.contains("D"), "Filter does not work!");
      this.assertTrue(this.__filter.contains("E"), "Filter does not work!");
      this.assertTrue(this.__filter.contains("F"), "Filter does not work!");
      this.assertTrue(this.__filter.contains("G"), "Filter does not work!");      
      // check the length
      this.assertEquals(4, this.__filter.length, "Too much elements in the data.");        
    },
    
    
    testChangeModelToNull: function() {
      this.__filter.setModel(null);
      
      // check the length
      this.assertEquals(0, this.__filter.length, "Too much elements in the data.");      
    },
    
    
    testChangeRuleToNull: function() {
      this.__filter.setRule(null);
      
      // check the length
      this.assertEquals(7, this.__filter.length, "Too much elements in the data.");      
    },
    
    
    testWithObject: function() {
      var model = new qx.data.Array();
      // create an array with objects
      for (var i = 0; i < 10; i++) {
        model.push(new qx.ui.core.Widget());
        model.getItem(i).setZIndex(i % 2);
      }
      
      var rule = function(data) {
        return data.getZIndex() == 1; 
      }
      
      var filter = new qx.data.filter.Array(model, rule);
      
      // check if only objects 
      for (var i = 0; i < filter.length; i++) {
        this.assertEquals(1, filter.getItem(i).getZIndex(), "Wrong object in the filtered data.");
      }
      
      // check for the length
      this.assertEquals(5, filter.length, "Too much elements in the data.");      
    },
    
    
    testObjectWithPropertyChangeSingle: function() {
      var model = new qx.data.Array();
      // create an array with objects
      for (var i = 0; i < 10; i++) {
        model.push(new qx.ui.core.Widget());
        model.getItem(i).setZIndex(i % 2);
      }
      
      var rule = function(data) {
        return data.getZIndex() == 1; 
      }
      
      var filter = new qx.data.filter.Array(model, rule);
      filter.setUpdateProperty("zIndex");
      
      // check if only objects 
      for (var i = 0; i < filter.length; i++) {
        this.assertEquals(1, filter.getItem(i).getZIndex(), "Wrong object in the filtered data.");
      }
      
      // set all zIndex values to 0
      for (var i = 0; i < model.length; i++) {
        model.getItem(i).setZIndex(0);
      }
      
      // check if the filteredData is empty
      this.assertEquals(0, filter.length, "Too much elements in the data.");      
    }
    

  }
});
