addSample(".table", {
  html: [
    '<-- Click on table header to sort column -->',
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
  },
  executable: true
});
