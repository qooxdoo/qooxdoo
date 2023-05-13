# Using the remote table model

The remote table should be used whenever you want to display a large amount of
data in a performant way.

As this table model loads its data on-demand from a backend, only those rows are
loaded that are near the area the user is currently viewing. If the user
scrolls, the rows that will be displayed soon are loaded asynchronously in the
background. All loaded data is managed in a cache that automatically removes the
last recently used rows when it gets full.

To get this model up and running you have to implement the actual loading of the
row data by yourself in a subclass.

## Implement your subclass

To correctly implement the remote table model you have to define/overwrite two
methods `_loadRowCount` and `_loadRowData`. Both are automatically called by the
table widget.

```javascript
qx.Class.define("myApplication.table.RemoteDataModel",
{
  extend : qx.ui.table.model.Remote,

  members :
  {
     // overridden - called whenever the table requests the row count
    _loadRowCount()
    {
      // Call the backend service (example) - using XmlHttp
      const url  = "http://localhost/services/getTableCount.php";
      const req = new qx.io.remote.Request(url, "GET", "application/json");

      // Add listener
      req.addListener("completed", this._onRowCountCompleted, this);

      // send request
      req.send();
    },

    // Listener for request of "_loadRowCount" method
    _onRowCountCompleted(response)
    {
       const result = response.getContent();
       if (result != null)
       {
          // Apply it to the model - the method "_onRowCountLoaded" has to be called
          this._onRowCountLoaded(result);
       }
    },

    // overridden - called whenever the table requests new data
    _loadRowData(firstRow, lastRow)
    {
       // Call the backend service (example) - using XmlHttp
       const baseUrl  = "http://localhost/services/getTableRowData.php";
       const parameters = "?from=" + firstRow + "&to=" + lastRow;
       const url = baseUrl + parameters;
       const req = new qx.io.remote.Request(url, "GET", "application/json");

       // Add listener
       req.addListener("completed", this._onLoadRowDataCompleted, this);

       // send request
       req.send();
    },

     // Listener for request of "_loadRowData" method
    _onLoadRowDataCompleted(response)
    {
       const result = response.getContent();
       if (result != null)
       {
          // Apply it to the model - the method "_onRowDataLoaded" has to be called
          this._onRowDataLoaded(result);
       }
    }
  }
});
```

### Using your remote model

Now that you've set up the remote table model the table component can use it.

```javascript
const remoteTableModelInstance = new myApplication.table.RemoteDataModel();
yourTableInstance.setTableModel(remoteTableModelInstance);
```

That's all you need to ensure your table is using your remote model.

### Sorting your data

The table component offers sortable columns to let users sort the data the way
they like. You can enable this sorting ability for each column. Since you have
to pull the data into the table yourself you have to update the table data once
the user changes the sorting criteria. You have to enhance the `_loadRowData`
method with this information to inform your backend how to sort the data.

```javascript
// "_loadRowData" with sorting support
_loadRowData(firstRow, lastRow)
{
    // Call the backend service (example) - using XmlHttp
    const baseUrl  = "http://localhost/services/getTableRowData.php";
    let parameters = "?from=" + firstRow + "&to=" + lastRow;

    // get the column index to sort and the order
    const sortIndex = this.getSortColumnIndex();
    const sortOrder =  this.isSortAscending() ? "asc" : "desc";

    // setting the sort parameters - assuming the backend knows these
    parameters += "&sortOrder=" + sortOrder + "&sortIndex=" + sortIndex;

    const url = baseUrl + parameters;
    const req = new qx.io.remote.Request(url, "GET", "application/json");

    // Add listener
    req.addListener("completed", this._onLoadRowDataCompleted, this);

    // send request
    req.send();
}
```

## Backend

The backend has to deliver the requested data in a JSON data structure in order
to display the data correctly. The data structure has to use the same IDs as the
remote table model instance at the client-side.

For example

```javascript
const remoteModel = new myApplication.table.RemoteDataModel();

// first param: displayed names, second param: IDs
remoteModel.setColumns( [ "First name", "Last name" ], [ "first", "last" ] );
```

Then the data delivered by the backend should have the following structure:

```
result = {[
  { "first" : "John", "last" : "Doe"  },
  { "first" : "Homer", "last" : "Simpson"  },
  { "first" : "Charlie", "last" : "Brown"  },
  ...
]};
```

Moreover, the backend has to deliver the row count, i.e. the number of rows the
table contains. This is what the `_loadRowCount` function of your subclass
expects to get. Please make sure that the URLs
`http://localhost/services/getTableCount.php` and
`http://localhost/services/getTableRowData.php` of your subclass point to the
right location.

## Summary

This short and very basic example is far from complete and in your application
you will have to implement some more features like error-handling, but it should
give you a short overview of how to implement the remote table model in Qooxdoo.
