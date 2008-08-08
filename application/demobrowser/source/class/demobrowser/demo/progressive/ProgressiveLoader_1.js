/*
 * Example of using the Image cell renderer with Progressive''s Table.
 * This also demonstrates how the minimum row height can be set by a
 * cell renderer.
 */
qx.Class.define("demobrowser.demo.progressive.ProgressiveLoader_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      // We'll use the progressive table's progress footer.  For that, we
      // need to define column widths as if we were a table.
      var columnWidths = new qx.ui.progressive.renderer.table.Widths(1);
      columnWidths.setWidth(0, "100%");

      // Instantiate a Progressive
      var footer = new qx.ui.progressive.headfoot.Progress(columnWidths);
      var structure = new qx.ui.progressive.structure.Default(null, footer);
      var progressive = new qx.ui.progressive.Progressive(structure);

      var addFunc = function(func)
      {
        var ret =
        {
          renderer : "func",
          data     : func
        };
        return ret;
      };

      // Instantiate a data model and populate it.
      var dataModel = new qx.ui.progressive.model.Default();
      var rowData = [ ];

      // Instantiate a Function Caller
      var functionCaller =
        new qx.ui.progressive.renderer.FunctionCaller();

      // Give Progressive the renderer, and assign a name
      progressive.addRenderer("func", functionCaller);

      var qooxdooUrl = "http://resources.qooxdoo.org/images/logo.gif";
      var qooxdoo = new qx.ui.basic.Image(qooxdooUrl, "100%", "100%");
      progressive.add(qooxdoo);

      // Make the Progressive fairly small
      progressive.set(
        {
          height          : 100,
          width           : 272,
          zIndex          : 99999,
          backgroundColor : "gray",
          opacity         : 0.86,
          batchSize       : 10
        });

      this.getRoot().add(progressive,
            {
              top             : -1000, // initially off screen
              left            : -1000
            });

      var pages =
        [
          { text : "Red",    background : "red",    color : "white" },
          { text : "Green",  background : "green",  color : "white" },
          { text : "Blue",   background : "blue",   color : "white" },
          { text : "Purple", background : "purple", color : "white" },
          { text : "Yellow", background : "yellow", color : "black" }
        ];

      // Wait for execution to start so we can provide a place to store
      // references to objects we add to the application.
      this.context =
        {
          document : this.getRoot(),
          pages    : pages
        };
      progressive.addEventListener(
        "renderStart",
        function(e)
        {
          // Our event data is an object containing the 'state' object and
          // the number of elements to be rendered.
          var state = e.getData().state;
          var initialNum = e.getData().initial;

          // Center ourself
          var root = this.getRoot();
          var progressive = e.getData().state.getProgressive();

          var left = (root.getClientWidth() - progressive.getBoxWidth()) / 2;
          var top = (root.getClientHeight() - progressive.getBoxHeight()) / 2;

          progressive.set(
            {
              left : left < 0 ? 0 : left,
              top  : top < 0 ? 0 : top
            });

          // Save our context in the userData field of the state object.
          state.getUserData().context = this.context;

          // Also save the number of elements for our progress bar usage.
          state.getUserData().initialNum = initialNum;
        },
        this);

      progressive.addEventListener(
        "renderEnd",
        function(e)
        {
          // We don't need the Progressive any longer.  Arrange for it to be
          // destroyed.
          qx.client.Timer.once(
            function()
            {
              this.getParent().remove(this);
              this.dispose();
            },
            this, 0);
        });

      // Create the tabview which is the basis of our GUI
      dataModel.addElement(addFunc(
        function(userData)
        {
          // Get our context
          context = userData.context;

          // Create the tabview
          context.tabview = new qx.ui.pageview.tabview.TabView();
          context.tabview.setEdge(20);
          context.document.add(context.tabview);

          // We're ready to create our first page
          context.page = 0;
          context.currentPage = null;

          // We want to save the first button to get back to it later
          context.firstButton = null;
        }));

      for (var page = 0; page < pages.length; page++)
      {
        // Create this page
        dataModel.addElement(addFunc(
          function(userData)
          {
            // Get our page index
            var pageInfo = context.pages[context.page];

            // Create the first button
            var button = new qx.ui.pageview.tabview.Button(pageInfo.text);
            button.setWidth(80);
            button.setBackgroundColor(pageInfo.background);
            button.setTextColor(pageInfo.color);
            button.setChecked(true);

            // If this is the first button, save it
            if (! context.firstButton)
            {
              context.firstButton = button;
            }

            // Add the button to the tabview's button bar
            context.tabview.getBar().add(button);

            // Create the page
            var page = new qx.ui.pageview.tabview.Page(button);

            // Add the page to the tabview's pane
            context.tabview.getPane().add(page);

            // Save a starting row and column number for our page widgets
            context.row = 0;
            context.col = 0;

            // Create a vertical layout in which we'll place each row
            context.vLayout = new qx.ui.layout.VerticalBoxLayout();
            context.vLayout.set(
              {
                left    : 0,
                right   : 0,
                height  : "auto",
                spacing : 4
              });

            // Add the vertical layout to this page
            page.add(context.vLayout);
          }));

        // For each row on this page...
        for (var row = 0; row < 20; row++)
        {
          // Create a horizontal layout for this row
          dataModel.addElement(addFunc(
            function(userData)
            {
              // Get our context
              context = userData.context;

              // Create the horizontal layout
              context.hLayout = new qx.ui.layout.HorizontalBoxLayout();
              context.hLayout.set(
                {
                  left                  : 0,
                  width                 : "100%",
                  height                : "auto",
                  verticalChildrenAlign : "middle",
                  spacing               : 4
                });

              // Add this horizontal layout to the vertical layout
              context.vLayout.add(context.hLayout);

              // Reset the column number
              context.col = 0;
            }));

          for (var col = 0; col < 10; col++)
          {
            // A an element to the horizontal layout
            dataModel.addElement(addFunc(
              function(userData)
              {
                // Get our context
                context = userData.context;

                // Get our page index
                var pageInfo = context.pages[context.page];

                // Create an object to add
                var o = new qx.ui.basic.Atom("row " + context.row +
                                             ", " +
                                             "col " + context.col);
                o.set(
                  {
                    width           : "1*",
                    backgroundColor : pageInfo.background,
                    textColor       : pageInfo.color
                  });

                // Add it to the current horizontal layout
                context.hLayout.add(o);
              }));

            // Increment to the next column
            dataModel.addElement(addFunc(
              function(userData)
              {
                ++userData.context.col;
              }));
          }

          // Increment to the next row
          dataModel.addElement(addFunc(
            function(userData)
            {
              ++userData.context.row;
            }));
        }

        // Increment to the next page
        dataModel.addElement(addFunc(
          function(userData)
          {
            ++userData.context.page;
          }));
      }


      // Switch to the first page
      dataModel.addElement(addFunc(
        function(userData)
        {
          userData.context.firstButton.setChecked(true);
        }));

      // Tell Progressive about its data model
      progressive.setDataModel(dataModel);


      // Begin execution
      progressive.render();
    }
  }
});
