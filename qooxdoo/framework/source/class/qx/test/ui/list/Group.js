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

qx.Class.define("qx.test.ui.list.Group",
{
  extend : qx.test.ui.list.AbstractListTest,

  members :
  {
    __names : ["Luise Siemer", "Trauhard Franke", "Sarina Wilde", "Florine Bähr",
       "Sigurd Adolph", "Sigmund Kurz", "Pankratius Hill", "Gerlinda Seel",
       "Trixi Clauß", "Cecilia Hemmer", "Rosely Fröhlich", "Annemargret Hunger",
       "Dietgar Münster", "Bertwin Joseph", "Edwina Schwarz", "Riana Dirks"],

    createModelData : function() {
      return qx.data.marshal.Json.createModel(this.__names);
    },


    testGroup : function()
    {
      var groupedModel = qx.data.marshal.Json.createModel([
        "L", "Luise Siemer",
        "T", "Trauhard Franke", "Trixi Clauß",
        "S", "Sarina Wilde", "Sigurd Adolph", "Sigmund Kurz",
        "F", "Florine Bähr",
        "P", "Pankratius Hill",
        "G", "Gerlinda Seel",
        "C", "Cecilia Hemmer",
        "R", "Rosely Fröhlich", "Riana Dirks",
        "A", "Annemargret Hunger",
        "D", "Dietgar Münster",
        "B", "Bertwin Joseph",
        "E", "Edwina Schwarz"
      ]);

      var delegate = {
        group : function(item) {
          return item.charAt(0).toUpperCase();
        }
      };
      this._list.setDelegate(delegate);
      this.flush();

      this.assertModelEqualsRowData(groupedModel, this._list);
      this.assertEquals(groupedModel.getLength(), this._list.getPane().getRowConfig().getItemCount(), "On Layer");
      this.assertEquals(12, this._list.getGroups().getLength(), "On List");
      groupedModel.dispose();
    },

    testDefaultGroup : function()
    {
      var groupedModel = qx.data.marshal.Json.createModel([
        "L", "Luise Siemer",
        "T", "Trauhard Franke", "Trixi Clauß",
        "???", "Sarina Wilde", "Sigurd Adolph", "Sigmund Kurz",
        "F", "Florine Bähr",
        "P", "Pankratius Hill",
        "G", "Gerlinda Seel",
        "C", "Cecilia Hemmer",
        "R", "Rosely Fröhlich", "Riana Dirks",
        "A", "Annemargret Hunger",
        "D", "Dietgar Münster",
        "B", "Bertwin Joseph",
        "E", "Edwina Schwarz"
      ]);

      var delegate = {
        group : function(item) {
          var group = item.charAt(0).toUpperCase();
          if (group == "S") {
            return null;
          }
          return item.charAt(0).toUpperCase();
        }
      };
      this._list.setDelegate(delegate);
      this.flush();

      this.assertModelEqualsRowData(groupedModel, this._list);
      this.assertEquals(groupedModel.getLength(), this._list.getPane().getRowConfig().getItemCount(), "On Layer");
      this.assertEquals(12, this._list.getGroups().getLength(), "On List");
      groupedModel.dispose();
    },

    testGroupWithSorter : function()
    {
      var groupedModel = qx.data.marshal.Json.createModel([
        "T", "Trixi Clauß", "Trauhard Franke",
        "S", "Sigurd Adolph", "Sigmund Kurz", "Sarina Wilde",
        "R", "Rosely Fröhlich", "Riana Dirks",
        "P", "Pankratius Hill",
        "L", "Luise Siemer",
        "G", "Gerlinda Seel",
        "F", "Florine Bähr",
        "E", "Edwina Schwarz",
        "D", "Dietgar Münster",
        "C", "Cecilia Hemmer",
        "B", "Bertwin Joseph",
        "A", "Annemargret Hunger"
      ]);

      var delegate = {
        sorter : function(a, b) {
          return a < b ? 1 : a > b ? -1 : 0;
        },
        group : function(item) {
          return item.charAt(0).toUpperCase();
        }
      };
      this._list.setDelegate(delegate);
      this.flush();

      this.assertModelEqualsRowData(groupedModel, this._list);
      this.assertEquals(groupedModel.getLength(), this._list.getPane().getRowConfig().getItemCount(), "On Layer");
      this.assertEquals(12, this._list.getGroups().getLength(), "On List");
      groupedModel.dispose();
    }
  }
});
