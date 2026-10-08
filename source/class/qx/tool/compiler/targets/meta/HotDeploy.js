const fs = require("fs");
const path = require("path");

qx.Class.define("qx.tool.compiler.targets.meta.HotDeploy", {
  extend: qx.core.Object,

  construct(maker) {
    super();
    this.__maker = maker;
    maker.addListener("writingApplications", this.__onWritingApplications, this);
    this.__syncDatabase = {};
  },

  properties: {
    /** Where to deploy the files */
    destination: {
      check: "String",
      apply: "_applyDestination"
    },

    /** SSH key to use for the deployment */
    sshKey: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** Command to execute on the remote server after deployment */
    command: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** Whether to output verbose logs */
    verbose: {
      init: false,
      check: "Boolean"
    }
  },

  members: {
    /** @type{Object<String, Boolean>} list of files to be copied during deploy */
    __requiredFiles: null,

    /** @type{Object<String, Boolean>} list of files that have been written to disk */
    __writtenFiles: null,

    /** @type{Object} SSH configuration for the deployment, passed to ssh2 `Client.connect` */
    __sshConfig: null,

    __syncDatabase: null,

    /**
     * Apply for `destination` property.
     */
    _applyDestination(dest) {
      if (dest.startsWith("ssh://")) {
        dest = dest.substring("ssh://".length);
        let m = dest.match(/^([^:@]+)(:(.+))?@(.*)$/);
        let username = null;
        let password = null;
        if (m) {
          username = m[1];
          password = m[3] ? m[3] : null;
          dest = m[4];
        }
        m = dest.match(/^([^:/]+)(:([0-9]+))?(.*)$/);
        let host = null;
        let port = null;
        let path = null;
        if (m) {
          host = m[1];
          port = m[3] ? parseInt(m[3], 10) : null;
          path = m[4];
        } else {
          throw new Error("Invalid SSH destination format: " + this.getDestination());
        }

        this.__sshConfig = {
          host
        };
        if (port !== null) {
          this.__sshConfig.port = port;
        }
        if (username !== null) {
          this.__sshConfig.username = username;
        }
        if (password !== null) {
          this.__sshConfig.password = password;
        }
      } else {
        this.__sshConfig = null;
      }
    },

    /**
     * Event handler for when the maker is about to write applications.
     */
    __onWritingApplications() {
      this.__requiredFiles = {};
      this.__writtenFiles = {};
    },

    /**
     * Syncs all required files to the destination
     */
    async deploy() {
      let dest = this.getDestination();
      if (this.__sshConfig) {
        await this.__sendViaSsh();
      } else {
        for (let filename in this.__requiredFiles) {
          if (this.getVerbose()) {
            qx.tool.compiler.Console.getInstance().info("Deploying file: ", filename);
          }
          await qx.tool.utils.Utils.makeParentDir(filename);
          await qx.tool.utils.files.Utils.copyFile(filename, path.join(this.getDestination(), filename));
        }
        if (this.getCommand()) {
          const child_process = require("child_process");
          child_process.spawn("sh", ["-c", this.getCommand()], { stdio: "inherit" });
        }
      }
    },

    /**
     * Syncs the written files to the deployment destination.
     */
    async syncDeploy() {
      let dest = this.getDestination();
      if (!this.__writtenFiles || Object.keys(this.__writtenFiles).length === 0) {
        return;
      }

      if (this.__sshConfig) {
        await this.__connectToSsh(async (conn, sftp) => {
          await this.__syncFiles(sftp, this.__writtenFiles);
          this.__writtenFiles = {};
        });
      } else {
        for (let filename in this.__writtenFiles) {
          if (this.getVerbose()) {
            qx.tool.compiler.Console.getInstance().info("Deploying file: ", filename);
          }
          await qx.tool.utils.Utils.makeParentDir(filename);
          await qx.tool.utils.files.Utils.copyFile(filename, path.join(this.getDestination(), filename));
        }
      }
    },

    /**
     * Deploy the tracked files via SSH.
     */
    async __sendViaSsh() {
      await this.__connectToSsh(async (conn, sftp) => {
        await this.__syncFiles(sftp, this.__requiredFiles);
        this.__writtenFiles = {};

        if (this.getVerbose()) {
          qx.tool.compiler.Console.getInstance().info("Executing remote command: ", this.getCommand());
        }

        if (this.getCommand()) {
          await new Promise((resolve, reject) => {
            conn.exec(this.getCommand(), (err, stream) => {
              if (err) {
                reject(err);
                return;
              }
              stream
                .on("close", resolve)
                .on("data", data => {
                  console.log("STDOUT: " + data);
                })
                .stderr.on("data", data => {
                  console.log("STDERR: " + data);
                });
            });
          });
        }
      });
    },

    /**
     * Syncs files to remote server, checking modifiation times to avoid unnecessary transfers.
     *
     * @param {ssh2.SFTP} sftp SFTP client instance.
     * @param {String[]} filenames Array of local filenames to sync to the remote server.
     */
    async __syncFiles(sftp, filenames) {
      const util = require("util");
      const crypto = require("crypto");

      const readdir = util.promisify(sftp.readdir.bind(sftp));
      const open = util.promisify(sftp.open.bind(sftp));
      const close = util.promisify(sftp.close.bind(sftp));
      const mkdir = util.promisify(sftp.mkdir.bind(sftp));

      const getShaOfFile = async filename => {
        let data = await fs.readFileAsync(filename);
        let hash = crypto.createHash("sha256");
        hash.setEncoding("hex");
        hash.write(data);
        hash.end();
        let sha = hash.read();
        return sha;
      };

      let directoryNames = {};
      for (let filename in filenames) {
        let parentDir = path.dirname(filename);
        let segs = parentDir.split(path.sep);
        let tmp = "";
        for (let seg of segs) {
          if (tmp.length) {
            tmp += "/";
          }
          tmp += seg;
          directoryNames[tmp] = true;
        }
      }
      directoryNames = Object.keys(directoryNames).sort();

      let remoteDirectories = {};

      const populateRemoteDirectories = async directoryName => {
        let directoryFiles = remoteDirectories[directoryName];
        if (!directoryFiles) {
          directoryFiles = remoteDirectories[directoryName] = {};
          try {
            let remoteDirContents = await readdir(directoryName);
            for (let file of remoteDirContents) {
              directoryFiles[file.filename] = file;
            }
          } catch (ex) {
            //
          }
        }
      };

      for (let directoryName of directoryNames) {
        let parentDir = path.dirname(directoryName);
        await populateRemoteDirectories(parentDir);
        await populateRemoteDirectories(directoryName);
        let parentDirFiles = remoteDirectories[parentDir];
        if (parentDirFiles[path.basename(directoryName)]) {
          continue;
        }

        try {
          await mkdir(directoryName, {});
        } catch (ex) {
          //
        }
      }

      for (let filename in filenames) {
        let dirname = path.dirname(filename);
        let remoteFiles = remoteDirectories[dirname];

        // Check for identical modified time
        let remoteFile = remoteFiles[path.basename(filename)];
        if (remoteFile) {
          let stat = fs.statSync(filename);
          let localTime = Math.round(stat.mtimeMs / 1000);
          let remoteTime = remoteFile.attrs.mtime;
          if (localTime <= remoteTime) {
            continue;
          }
        }

        // Check for identical file content using SHA; this is not saved to disk, but it is a lot faster
        // than uploading.  The issue is that the make process will often re-write files unnecessarily and
        // end up with identical content, even if the modified time has changed.
        let fileSha = await getShaOfFile(filename);
        let fileInfo = this.__syncDatabase[filename];
        if (!fileInfo) {
          fileInfo = this.__syncDatabase[filename] = {};
        }
        if (fileSha === fileInfo.sha) {
          continue;
        }
        fileInfo.sha = fileSha;

        if (this.getVerbose()) {
          qx.tool.compiler.Console.getInstance().info("Deploying file: ", filename);
        }
        let handle = await open(filename, "w", {});
        let ws = sftp.createWriteStream(filename);
        let rs = fs.createReadStream(filename);
        let promise = new qx.Promise();
        ws.on("close", () => promise.resolve());
        rs.pipe(ws);
        await promise;
        await close(handle);
      }
    },

    /**
     * Connects to SSH and call the provided callback with the SSH connection and SFTP session.
     *
     * @param {AsyncFunction} cb
     */
    async __connectToSsh(cb) {
      const { Client } = require("ssh2");

      let conn = new Client();
      let promise = new qx.Promise();
      conn.on("ready", () => {
        conn.sftp((err, sftp) => {
          if (err) {
            throw err;
          }
          cb(conn, sftp)
            .then(() => {
              conn.end();
              promise.resolve();
            })
            .catch(err => {
              promise.reject(err);
            });
        });
      });
      let sshConfig = qx.lang.Object.clone(this.__sshConfig);
      if (this.getSshKey()) {
        sshConfig.privateKey = this.getSshKey();
      }
      try {
        conn.connect(sshConfig);
      } catch (err) {
        console.error("Failed to connect via SSH:", err);
        process.exit(1);
      }
      await promise;
    },

    /**
     * Called to notify that a file has been written - this is to track files that have been output
     * by the maker as part of the build process.
     *
     * @param {String} filename
     */
    writtenFile(filename) {
      this.__requiredFiles[filename] = true;
      this.__writtenFiles[filename] = true;
    },

    /**
     * Called to notify that a file is required - this is to track files in `transpiled/` which
     * need to be copied across if modified; the `HotDeploy` class is expected to track modification
     * types and determine if is necessary to copy them across.
     *
     * @param {String} filename
     */
    requiredFile(filename) {
      this.__requiredFiles[filename] = true;
    }
  }
});
