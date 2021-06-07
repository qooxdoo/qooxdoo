/**
 * This is the main application class of "virtuallist"
 *
 * @asset(virtualtable/*)
 */
qx.Class.define("virtuallist.Application", {
  extend : qx.application.Standalone,

  members : {
    main : function() {
      this.base(arguments);

      qx.log.appender.Native;
      qx.log.appender.Console;

      var doc = this.getRoot();
			var root = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
			doc.add(root, { left: 0, top: 0, right: 0, bottom: 0 });
      
      (function() {
        let words = [ "Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliett", "Kilo", "Lima", 
          "Mike", "November", "Oscar", "Papa", "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey", 
          "X-ray", "Yankee", "Zulu" ];
        let dt = new Date();
        let myBool = false;
        let model = words.map((w, index) => {
          dt = new Date(dt.getTime());
          dt.setDate(dt.getDate() + 1);
          myBool = !myBool;
          return { name: w, when: dt, trueOrFalse: myBool, number: (index + 1) + Math.random() };
        });
        model = qx.data.marshal.Json.createModel(model);
        
        let table = new qx.ui.list.List().set({ width: 400, height: 200 });
        let provider = table.getProvider();
        table.getPane().setCellPadding([ 4, 6, 4, 6 ]);
        provider.addColumn(new qx.ui.list.column.TextColumn().set({ caption: "Name", path: "name", flex: 1 }));
        provider.addColumn(new qx.ui.list.column.DateLabelColumn().set({ caption: "When", path: "when" }));
        provider.addColumn(new qx.ui.list.column.BooleanColumn().set({ caption: "True or False?", path: "trueOrFalse" }));
        provider.addColumn(new qx.ui.list.column.NumberColumn().set({ caption: "A Number", path: "number" }));
        
        table.setModel(model);
        
        let sel = table.getSelection();
        sel.addListener("change", () => {
          console.log("Table Selection Change: " + JSON.stringify(sel.toArray().map(i => i.getName())));
        });
        
        root.add(table);
      })();

      (function() {
        var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
  
        var title = new qx.ui.basic.Label("One as selection mode").set({
          font: "bold"
        });
        container.add(title);
  
        // Creates the model data
        var modelGroups = [];
        for (var i = 0; i < 25; i++) {
          modelGroups.push({ label: "Group No " + (i + 1), icon: "icon/16/places/folder.png" });
        }
        modelGroups = qx.data.marshal.Json.createModel(modelGroups);
        var model = [];
        for (var i = 0; i < 250; i++) {
          model.push({ label: "Item No " + (i + 1), group: modelGroups.getItem(Math.floor(i/10)), icon: "icon/16/places/folder.png" });
        }
        model = qx.data.marshal.Json.createModel(model);
  
        // Creates the list and configures it
        var list = new qx.ui.list.List().set({
          selectionMode : "additive",
          height: 280,
          width: 300,
          repeatingColumnCount: 2,
          labelPath: "label",
          iconPath: "icon",
          groupLabelPath: "label",
          autoGrouping: false,
          groups: modelGroups,
          draggable: true,
          droppable: true,
          delegate: {
            group: item => {
              return item.getGroup();
            }
          },
          model: model
        });
        container.add(list, {top: 20});
  
        // Pre-Select "Item No 16"
        let sel = list.getSelection();
        sel.replace(model.getItem(16));
        sel.addListener("change", () => {
          console.log("One Column Selection Change: " + JSON.stringify(sel.toArray().map(i => i.getLabel())));
        });
        
        root.add(container);
      });//();      

    }
  },
  
  statics: {
    /**
     * Unit tests all methods in a class where the method name begins "test", unless the
     * `methodNames` parameter is provided to list the method names explicitly.  Tests can be
     * asynchronous, so this returns a promise
     * 
     *  @param clazz {Class} the class to unit test
     *  @param methodNames {String[]?} optional list of method names
     *  @return {qx.Promise} promise for completion of all tests
     */
    runAll: function(clazz, methodNames) {
      function showExceptions(arr) {
        arr.forEach(item => {
          qx.log.Logger.error(item.test.getClassName() + "." + item.test.getName() + ": " + item.exception);
        });
      };

      if (!methodNames) {
        methodNames = [];
        Object.keys(clazz.prototype).forEach(function(name) {
          if (name.length < 5 || !name.startsWith("test") || name.substring(4, 5) != name.substring(4, 5).toUpperCase())
            return;
          methodNames.push(name);
        });
      }
      
      return new qx.Promise((resolve) => {
        var pos = clazz.classname.lastIndexOf('.');
        var pkgname = clazz.classname.substring(0, pos);
        var loader = new qx.dev.unit.TestLoaderBasic(pkgname);
        loader.getSuite().add(clazz);
        
        var testResult = new qx.dev.unit.TestResult();
        testResult.addListener("startTest", evt => { 
          qx.log.Logger.info("Running test " + evt.getData().getFullName()); 
        });
        testResult.addListener("endTest", evt => { 
          qx.log.Logger.info("End of " + evt.getData().getFullName());
          setTimeout(next, 1);
        });
        testResult.addListener("wait", evt => qx.log.Logger.info("Waiting for " + evt.getData().getFullName()));
        testResult.addListener("failure", evt => showExceptions(evt.getData()));
        testResult.addListener("error", evt => showExceptions(evt.getData()));
        testResult.addListener("skip", evt => showExceptions(evt.getData()));
        
        var methodNameIndex = -1;
        function next() {
          methodNameIndex++;
          if (!methodNames) {
            if (methodNameIndex === 0){
              loader.runTests(testResult, clazz.classname, null);
            } else {
              resolve();
            }
          } else {
            if (methodNameIndex < methodNames.length)
              loader.runTests(testResult, clazz.classname, methodNames[methodNameIndex]);
            else
              resolve();
          }
        }

        next();
      });
    }
    
  }
});