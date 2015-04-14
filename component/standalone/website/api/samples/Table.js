addSample(".table", {
  html: [
    '<!-- Click on table header to sort column -->',
    ' <div class="qx-table-toolbar">',
    '   <label for="keyword">Filter: </label><input id="keyword" type="text" />',
    ' </div>',
    ' <table id="data">',
    '   <thead>',
    '     <tr>',
    '       <th>Component</th>',
    '       <th>Description</th>',
    '       <th>Features</th>',
    '     </tr>',
    '   </thead>',
    '   <tbody>',
    '     <tr>',
    '       <td>Website</td>',
    '       <td>DOM, Events, Templating</td>',
    '       <td>Browser abstraction, DOM manipulation, Events, Templating, Animation</td>',
    '     </tr>',
    '     <tr>',
    '       <td>Mobile</td>',
    '       <td>Android, iOS, WP8, HTML5</td>',
    '       <td>Pages, Navigation, Forms, Layouting, Theming</td>',
    '     </tr>',
    '     <tr>',
    '       <td>Desktop</td>',
    '       <td>Single-page applications</td>',
    '       <td>Windows, Tabs, Forms, Lists, Trees, Toolbars, Menus, Layouting, Theming, Data binding</td>',
    '     </tr>',
    '     <tr>',
    '       <td>Server</td>',
    '       <td>Node.js & Rhino</td>',
    '       <td>Classes, mixins, interfaces, Properties, Events, Single Value Binding</td>',
    '     </tr>',
    '   </tbody>',
    '</table>'
  ],
  javascript: function () {
    var table = q('#data').table();
    q('#keyword').on('keyup', function () {
      table.filter(this.getValue());
    });
    table.render();
  },
  executable: true
});

addSample(".table", {
  html: [
    ' <div class="qx-table-toolbar">',
    '   <label for="keyword">Filter: </label><input id="keyword" type="text" />',
    ' </div>',
    ' <table id="data">',
    '   <thead>',
    '     <tr>',
    '       <th data-qx-table-col-type="String" data-qx-table-col-name="Name">Name</th>',
    '       <th data-qx-table-col-type="String" data-qx-table-col-name="Position">Position</th>',
    '       <th data-qx-table-col-type="String" data-qx-table-col-name="Office">Office</th>',
    '       <th data-qx-table-col-type="Number" data-qx-table-col-name="Age">Age</th>',
    '       <th data-qx-table-col-type="Numder" data-qx-table-col-name="StartDate">Start date</th>',
    '       <th data-qx-table-col-type="Number" data-qx-table-col-name="Salary">Salary</th>',
    '     </tr>',
    '   </thead>',
    '   <tbody></tbody>',
    '</table>'
  ],
  javascript: function () {
    /*
     * Each cell will be descriped as an object (value and cellKey)
     * All cells are wrapped in an array
    [[
      {
        "value": "Tiger Nixon",
        "cellKey": "Tiger Nixon"
      },
      {
        "value": "System Architect",
        "cellKey": "System Architect"
      },
      ...
    ]]
     */
    var modelPath = "data/model.json";
    var request = new q.io.xhr(modelPath);
    request.on("load", function (event) {
      var model = JSON.parse(event.responseText);

      var table = q("#data").table(model);
      q("#keyword").on("keyup", function () {
        table.filter(this.getValue());
      });
      table.render();
    });
    request.send();
  }
});