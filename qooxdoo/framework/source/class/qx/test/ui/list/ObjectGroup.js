/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.list.ObjectGroup",
{
  extend : qx.test.ui.list.AbstractListTest,

  members :
  {
    __names : ["Luise Siemer", "Trauhard Franke", "Sarina Wilde", "Florine Bähr",
       "Sigurd Adolph", "Sigmund Kurz", "Pankratius Hill", "Gerlinda Seel",
       "Trixi Clauß", "Cecilia Hemmer", "Rosely Fröhlich", "Annemargret Hunger",
       "Dietgar Münster", "Bertwin Joseph", "Edwina Schwarz", "Riana Dirks"],

    __groups : null,
       
    createModelData : function() {
      this._model = new qx.data.Array();
    },

    
    tearDown : function() {
      this.base(arguments);
      
      this.__groups == null;
    },
    

    testGroup : function()
    {
      // Expected result
      // "L", "Luise Siemer",
      // "T", "Trauhard Franke", "Trixi Clauß",
      // "S", "Sarina Wilde", "Sigurd Adolph", "Sigmund Kurz",
      // "F", "Florine Bähr",
      // "P", "Pankratius Hill",
      // "G", "Gerlinda Seel",
      // "C", "Cecilia Hemmer",
      // "R", "Rosely Fröhlich", "Riana Dirks",
      // "A", "Annemargret Hunger",
      // "D", "Dietgar Münster",
      // "B", "Bertwin Joseph",
      // "E", "Edwina Schwarz"
      
      var groups = this.__groups = {};
      
      for (var i = 0; i < this.__names.length; i++) {
        var name = this.__names[i];
        var groupName = name.charAt(0);
        var group = groups[groupName]; 
        
        if (group == null)
        {
          group = groups[groupName] = new qx.test.ui.list.fixture.GroupMock();
          group.setName(groupName);
        }
        
        var item = new qx.test.ui.list.fixture.ItemMock();
        item.setName(name);
        item.setGroup(group);
        this._model.push(item);
      }
      
      this._list.setLabelPath("name");
      this._list.setGroupLabelPath("name");
      
      var delegate = {
        group : function(item) {
          return item.getGroup();
        }
      };
      this._list.setDelegate(delegate);
      this.flush();

      var groupedModel = this.__convertModel(this._model);
      this.assertModelEqualsRowData(groupedModel, this._list);
      this.assertEquals(groupedModel.getLength(), this._list.getPane().getRowConfig().getItemCount(), "On Layer");
      this.assertEquals(12, this._list._groups.getLength(), "On List");
    },

//    testDefaultGroup : function()
//    {
//      throw new Error("not implemented");
//    },
//
//    testGroupWithSorter : function()
//    {
//      throw new Error("not implemented");
//    },
    
    __convertModel : function(model) {
      var result = new qx.data.Array();
      
      // get all groups
      var groups = [];
      for (var i = 0; i < model.getLength(); i++)
      {
        var group = model.getItem(i).getGroup();
        
        if (groups.indexOf(group) == -1) {
          groups.push(group);
        }
      }
      
      // build results
      for (var i = 0; i < groups.length; i++)
      {
        result.push(groups[i]);
        
        for (var k = 0; k < model.getLength(); k++)
        {
          var item = model.getItem(k);
          var group = item.getGroup();
        
          if (groups[i] === group) {
            result.push(item);
          }
        }
      }
 
      return result;
    }
  }
});
