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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Using the Table, qx.ui.table.cellrenderer.Dynamic, qx.ui.table.celleditor.
 * Dynamic, qx.ui.table.celleditor.ComboBox
 * and cell value validation to build a property editor.
 *
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.table.Table_Cell_Editor",
{
  extend : demobrowser.demo.table.TableDemo,

  members :
  {
    getCaption : function() {
      return "Property editor table";
    },

    main : function()
    {
      this.base(arguments);

      this._container.resetWidth();
      this._container.setResizable(false);
    },

    /**
     * @lint ignoreDeprecated(alert)
     * @return {qx.ui.table.Table} table
     */
    createTable : function()
    {
      // create some example data
      var tableData =
      [
        [
          'username',
          'User Name',
          'jdoe',
          {'required':true}
        ],
        [
          'password',
          'Password',
          'secret',
          {
            'type': 'password',
            'required': true
          }
        ],
        [
          'role',
          'Role',
          'editable combobox',
          {
            'options':
            [
              'admin',
              'manager',
              'user'
            ],
            'editable': true
          }
        ],
        [
          'status',
          'Status',
          '0',
          {
            'options':
            [
              [
                'Inactive',
                null,
                '0'
              ],
              [
                'Active',
                null,
                '1'
              ],
              [
                'Waiting',
                null,
                '2'
              ]
            ]
          }
        ],
        [
          'email',
          'Email',
          'enter valid email',
          {
            'type': 'email'
          }
        ],
        [
          'telephone',
          'Telephone',
          'enter valid telephone number',
          {
            'regExp': '[0-9]+',
            'failMsg': 'Use only numbers!'
          }
        ],
        [
          'website',
          'Website',
          'enter website',
          {
            'validationFunc': function(newValue)
            {
              if (newValue.search(/^http:/)!=-1)
              {
                window.open(newValue);
              }
              return newValue;
            }
          }
        ],
        [
          'newsletter',
          'Newsletter',
          true,
          {
            'type': "checkbox"
          }
        ]
      ];

      // cell renderer factory function
      // returns a cell renderer instance
      var propertyCellRendererFactoryFunc = function (cellInfo)
      {
        var table = cellInfo.table;
        var tableModel = table.getTableModel();
        var rowData = tableModel.getRowData(cellInfo.row);
        var metaData = rowData[3];
        var renderer;

        for ( var cmd in metaData )
        {

          switch ( cmd )
          {
          case "type":
            switch ( metaData['type'])
            {
            case "checkbox":
              return new qx.ui.table.cellrenderer.Boolean;

            case "password":
              return new qx.ui.table.cellrenderer.Password;
            }
            break;

          case "options":
            var renderer = new qx.ui.table.cellrenderer.Replace;
            var replaceMap = {};
            metaData['options'].forEach(function(row){
            if (row instanceof Array)
              {
                replaceMap[row[0]]=row[2];
              }
            });
            renderer.setReplaceMap(replaceMap);
            renderer.addReversedReplaceMap();
            return renderer;
          }
        }
        return new qx.ui.table.cellrenderer.Default();
      }

      // create the  "meta" cell renderer object
      var propertyCellRendererFactory =
        new qx.ui.table.cellrenderer.Dynamic(propertyCellRendererFactoryFunc);

      // cell editor factory function
      // returns a cellEditorFactory instance based on data in the row itself
      var propertyCellEditorFactoryFunc = function (cellInfo)
      {
        var table = cellInfo.table;
        var tableModel = table.getTableModel();
        var rowData = tableModel.getRowData(cellInfo.row);
        var metaData = rowData[3];
        var cellEditor = new qx.ui.table.celleditor.TextField;
        var validationFunc = null;

        for ( var cmd in metaData )
        {
          switch ( cmd )
          {
          case "options":
            if (metaData.editable)
            {
              cellEditor = new qx.ui.table.celleditor.ComboBox();
            }
            else
            {
              cellEditor = new qx.ui.table.celleditor.SelectBox();
            }
            cellEditor.setListData( metaData['options'] );
            break;

          case "editable":
            break;

          case "type":
            switch ( metaData['type'] )
            {
            case "password":
              cellEditor = new qx.ui.table.celleditor.PasswordField;
              break;

            case "checkbox":
              cellEditor = new qx.ui.table.celleditor.CheckBox;
              break;

            case "email":
              cellEditor.setValidationFunction (
                function( newValue, oldValue )
                {
                  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.(\w{2}|(com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum))$/;
                  if ( re.test(newValue) )
                  {
                    return newValue;
                  }
                  alert("You did not enter a valid email address");
                  return oldValue;
                });
              break;
            }
            break;

          case "regExp":
            cellEditor.setValidationFunction (
              function( newValue, oldValue )
              {
                var re = new RegExp(metaData['regExp']);
                if ( re.test(newValue) )
                {
                  return newValue;
                }
                alert(metaData['failMsg']);
                return oldValue;
              });
            break;

          case "validationFunc":
            cellEditor.setValidationFunction (metaData['validationFunc']);
            break;

          case "required":
            validationFunc = function( newValue, oldValue )
            {
              if (! newValue)
              {
                alert("You need to supply a value here");
                return oldValue;
              }
              return newValue;
            };
            break;
          }
        }
        return cellEditor;
      }

      // create a "meta" cell editor object
      var propertyCellEditorFactory =
        new qx.ui.table.celleditor.Dynamic(propertyCellEditorFactoryFunc);

      // create table
      var propertyEditor_tableModel = new qx.ui.table.model.Simple();
      propertyEditor_tableModel.setColumns(
        [
          'Property',
          'Property',
          'Doubleclick on cell to edit value'
        ]);
      var propertyEditor_resizeBehaviour =
        {
          tableColumnModel : function(obj)
          {
            return new qx.ui.table.columnmodel.Resize(obj);
          }
        };
      var propertyEditor = new qx.ui.table.Table(
        propertyEditor_tableModel,propertyEditor_resizeBehaviour);

      // remove decor
      propertyEditor.setDecorator(null);

      // layout
      propertyEditor.setColumnVisibilityButtonVisible(false);
      propertyEditor.setKeepFirstVisibleRowComplete(true);
      propertyEditor.setStatusBarVisible(false);

      // selection mode
      propertyEditor.getSelectionModel().setSelectionMode(
        qx.ui.table.selection.Model.SINGLE_SELECTION);

      // Get the table column model
      var tcm = propertyEditor.getTableColumnModel();

      // first table columns is not visible, has the key
      tcm.setColumnVisible(0,false);

      // second column has the label
      tcm.getBehavior().setWidth(1,100);

      // third column for editing the value and has special cell renderers
      // and cell editors
      tcm.getBehavior().setWidth(2,300);
      propertyEditor_tableModel.setColumnEditable(2,true);
      tcm.setDataCellRenderer(2, propertyCellRendererFactory);
      tcm.setCellEditorFactory(2, propertyCellEditorFactory);

      // fourth column is not visible, has the metadata

      // set data
      propertyEditor.getTableModel().setData(tableData);

      // create event listener for data change event. this would normally
      // send the data back to the server etc.
      propertyEditor.getTableModel().addListener(
        "dataChanged",
        function(event)
        {
          if ( !(event instanceof qx.event.type.Data))
          {
            return;
          }
          var changedData = event.getData();

          // get changed data
          var model =
            this.getTableModel();
          var key =
            model.getValue(0,changedData.firstRow);
          var value =
            model.getValue(changedData.firstColumn, changedData.firstRow);

          this.info("User edited property '" + key +
                    "' and entered value '" + value +"'.");
        },
        propertyEditor);

      return propertyEditor;
    }
  }
});
