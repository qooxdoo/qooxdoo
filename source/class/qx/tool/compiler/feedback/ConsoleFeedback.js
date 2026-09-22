qx.Class.define("qx.tool.compiler.feedback.ConsoleFeedback", {
  extend: qx.core.Object,

  /**
   * @param {qx.tool.compiler.Compiler} compiler
   */
  construct(compiler) {
    super();
    this.__classStartTimes = {};

    let startTimes = {
      controller: 0,
      metaDb: 0,
      discovery: 0
    };
    const now = () => Date.now();
    const start = type => (startTimes[type] = now());
    const report = (type, name) => {
      let endTime = now();
      let time = endTime - startTimes[type];
      startTimes[type] = endTime;
      qx.tool.compiler.Console.logVerbose(`Startup for ${name} in ${time}ms`);
    };

    start("overall");
    compiler.addListener("starting", () => start("controller"));
    compiler.addListener("metaDbLoaded", () => report("controller", "Controller - Meta Database Loaded"));
    compiler.addListener("discoveryStarted", () => report("controller", "Controller - Discovery Started"));
    compiler.addListener("metaDbConfiguring", () => report("controller", "Controller - Meta Database Configuring"));
    compiler.addListener("metaDbConfigured", () => report("controller", "Controller - Meta Database Configured"));
    compiler.addListener("addedDiscoveredClasses", () => report("controller", "Controller - Add Discovered Classes"));
    compiler.addListener("writtenMetaData", () => report("controller", "Controller - Writing meta data"));
    compiler.addListener("started", () => {
      report("controller", "Controller - First compile");
      report("overall", "Overall Startup");
    });
    compiler.getMetaDb().addListener("starting", () => start("metaDb"));
    compiler.getMetaDb().addListener("started", () => report("metaDb", "Meta Database"));
    compiler.getDiscovery().addListener("starting", () => start("discovery"));
    compiler.getDiscovery().addListener("started", () => report("discovery", "File Discovery"));

    compiler.addListener("changesDetected", () => {
      qx.tool.compiler.Console.log("Changes detected, recompiling...");
    });

    let watchStartMsgSent = false;
    compiler.addListener("allDone", () => {
      qx.tool.compiler.Console.log("All applications ready.");
      if (!watchStartMsgSent && compiler.isWatch()) {
        watchStartMsgSent = true;
        qx.tool.compiler.Console.log("Start watching for changes...");
      }
    });

    compiler.addListener("classNeedsToBeCompiled", this.__onClassNeedsToBeCompiled, this);
    compiler.addListener("compilingClass", this.__onCompilingClass, this);
    compiler.addListener("compiledClass", this.__onCompiledClass, this);
    compiler.getDiscovery().addListener("fileAdded", this.__onFileAdded, this);
    compiler.getDiscovery().addListener("fileRemoved", this.__onFileRemoved, this);
    compiler.getDiscovery().addListener("fileChanged", this.__onFileChanged, this);
    compiler.addListener("addMaker", this.__onAddMaker, this);
  },

  members: {
    /** @type{Object<String,Integer>} start times in milliseconds of each class being compiled, indexed by classname */
    __classStartTimes: null,

    /**
     * Event handler for when a class file is detected
     *
     * @param {qx.event.type.Data} e
     */
    __onFileAdded(e) {
      let filename = e.getData();
      qx.tool.compiler.Console.logVerbose(`Added file ${filename} to discovery.`);
    },

    /**
     * Event handler for when a class file is deleted
     *
     * @param {qx.event.type.Data} e
     */
    __onFileRemoved(e) {
      let filename = e.getData();
      qx.tool.compiler.Console.logVerbose(`Removed file ${filename} from discovery.`);
    },

    /**
     * Event handler for when a class file is edited
     *
     * @param {qx.event.type.Data} e
     */
    __onFileChanged(e) {
      let filename = e.getData();
      qx.tool.compiler.Console.logVerbose(`Detected change to file ${filename} in discovery.`);
    },

    /**
     * Event handler for when a class needs to be compiled
     *
     * @param {qx.event.type.Data} e
     */
    __onClassNeedsToBeCompiled(e) {
      let { classname, maker } = e.getData();
      qx.tool.compiler.Console.logVerbose(`Class ${classname} needs to be compiled for ${maker.getTarget().getOutputDir()}.`);
    },

    /**
     * Event handler for when a class compilation starts
     *
     * @param {qx.event.type.Data} e
     */
    __onCompilingClass(e) {
      let { classname, analyzer } = e.getData();
      let key = `${analyzer.toHashCode()}:${classname}`;
      this.__classStartTimes[key] = new Date().getTime();
      let target = analyzer.getMaker().getTarget();
      qx.tool.compiler.Console.logVerbose(`${target.toString()}: Compiling class ${classname}...`);
    },

    /**
     * Event handler for when a class compilation finishes
     *
     * @param {qx.event.type.Data} e
     */
    __onCompiledClass(e) {
      let { classname, analyzer } = e.getData();
      let endTime = new Date().getTime();
      let key = `${analyzer.toHashCode()}:${classname}`;
      let startTime = this.__classStartTimes[key];
      delete this.__classStartTimes[key];

      let diff = endTime - startTime;
      let target = analyzer.getMaker().getTarget();
      qx.tool.compiler.Console.logVerbose(`${target.toString()}: Compiled class ${classname} in ${diff}ms.`);
    },

    /**
     * Event handler for when a maker is added
     *
     * @param {qx.event.type.Data} e
     */
    __onAddMaker(e) {
      let maker = e.getData();
      let id = maker.getTarget().getOutputDir();
      qx.tool.compiler.Console.log(`Maker added for: ${id}`);
      maker.addListener("writingApplications", () => qx.tool.compiler.Console.log(`${id}: Writing applications...`));
      maker.addListener("writtenApplication", evt =>
        qx.tool.compiler.Console.log(`${id}: Written application ${evt.getData().application.getName()}...`)
      );
    }
  }
});
