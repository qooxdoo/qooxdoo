/*
 * Example of using the Image cell renderer with Progressive''s Table.
 * This also demonstrates how the minimum row height can be set by a
 * cell renderer.
 */
qx.Class.define("demobrowser.demo.progressive.ProgressiveLoader",
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

      // We definitely want to see each progress as we're loading.  Ensure
      // that the widget queue gets flushed
      progressive.setFlushWidgetQueueAfterBatch(true);

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
      progressive.addListener(
        "renderStart",
        function(e)
        {
          // Our event data is an object containing the 'state' object and
          // the number of elements to be rendered.
          var state = e.getData().state;
          var initialNum = e.getData().initial;

          // Center ourself
          var rootBounds = this.getRoot().getBounds();
          var progressive = e.getData().state.getProgressive();
          var progressiveBounds = progressive.getBounds();

          var left =
            Math.floor((rootBounds.width - progressiveBounds.width) / 2);
          var top =
            Math.floor((rootBounds.height - progressiveBounds.height) / 2);

          progressive.setLayoutProperties(
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

      progressive.addListener(
        "renderEnd",
        function(e)
        {
          // We don't need the Progressive any longer.  Arrange for it to be
          // destroyed.
          qx.event.Timer.once(
            function()
            {
              this.getLayoutParent().remove(this);
              this.dispose();
            },
            this, 0);
        });

      // Create the tabview which is the basis of our GUI
      dataModel.addElement(addFunc(
        function(userData)
        {
          // Get our context
          var context = userData.context;

          // Create the tabview
          context.tabview = new qx.ui.tabview.TabView();
          context.tabview.set(
            {
//              height : 500
            });
          context.document.add(context.tabview,
                               {
                                 left  : 20,
                                 right : 20,
                                 top   : 20,
                                 bottom : 20
                               });

          // We're ready to create our first page
          context.page = 0;
          context.currentPage = null;
        }));

      for (var page = 0; page < pages.length; page++)
      {
        // Create this page
        dataModel.addElement(addFunc(
          function(userData)
          {
            // Get our context
            var context = userData.context;

            // Get our page index
            var pageInfo = context.pages[context.page];

            // Create the page
            context.currentPage = new qx.ui.tabview.Page(pageInfo.text);
            context.currentPage.setLayout(new qx.ui.layout.VBox(4));

            // Add the page to the tabview's pane
            context.tabview.add(context.currentPage);

            // Save a starting row and column number for our page widgets
            context.row = 0;
            context.col = 0;

            // Save the first page
            if (context.page == 0)
            {
              context.firstPage = context.currentPage;
            }
          }));

        // For each row on this page...
        for (var row = 0; row < 20; row++)
        {
          // Create a horizontal layout for this row
          dataModel.addElement(addFunc(
            function(userData)
            {
              // Get our context
              var context = userData.context;

              // Create the horizontal layout
              context.hBox =
                new qx.ui.container.Composite(new qx.ui.layout.HBox(4));

              // Add this horizontal layout to the vertical layout
              context.currentPage.add(context.hBox);

              // Set this page active to watch it do its thing
              context.tabview.setSelected(context.currentPage);

              // Reset the column number
              context.col = 0;
            }));

          for (var col = 0; col < 10; col++)
          {
            // Add elements to the horizontal layout
            dataModel.addElement(addFunc(
              function(userData)
              {
                // Get our context
                var context = userData.context;

                // Get our page index
                var pageInfo = context.pages[context.page];

                // Create an object to add
                var o = new qx.ui.basic.Atom("row " + context.row +
                                             ", " +
                                             "col " + context.col);
                o.set(
                  {
                    width           : 90,
                    backgroundColor : pageInfo.background,
                    textColor       : pageInfo.color
                  });

                // Add it to the current horizontal layout
                context.hBox.add(o);
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


      // Switch back to the first page
      dataModel.addElement(addFunc(
        function(userData)
        {
          userData.context.tabview.setSelected(userData.context.firstPage);
        }));

      // Tell Progressive about its data model
      progressive.setDataModel(dataModel);


      // Begin execution
      progressive.render();
    }
  }
});
