/* ************************************************************************

   qooxdoo

   https://qooxdoo.org

   Copyright:
     2022 OETIKER+PARTNER AG

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tobias Oetiker (oetiker)

************************************************************************ */

/**
 * The FileSelectorButton opens a window and lets the user pick one or several
 * files from the local filesystem. A FileList is returned which allows access
 * to the content of the selected files from javascript. The file(s) can now be
 *  processed in javascript, or it/they can be uploaded to a server.
 *
 * *Example*
 *
 * Post the content of the file to the server.
 *
 * ```javascript
 * let button = new qx.ui.form.FileSelectorButton("Select File");
 * button.addListener('changeFileSelection',function(e){
 * let fileList = e.getData();
 *   let form = new FormData();
 *   form.append('file',fileList[0]);
 *   let req = new qx.io.request.Xhr("upload",'POST').set({
 *     requestData: form
 *   });
 *   req.addListener('success',(e) => {
 *     let response = req.getResponse();
 *   });
 * });
 * ```
 *
 * Process the file directly in javascript using the FileReader API.
 *
 * ```javascript
 * let button = new qx.ui.form.FileSelectorButton("Select File");
 * button.addListener('changeFileSelection',function(e){
 *   let fileList = e.getData();
 *   const reader = new FileReader();
 *   reader.addEventListener('load', () => {
 *     let response = reader.result;
 *     console.log("The first 4 chrs are: " + response);
 *   });
 *   const file = fileList[0];
 *   reader.readAsText(file.slice(0,4));
 * });
 * ```
 *
 * [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications)
 */

qx.Class.define("qx.ui.form.FileSelectorButton", {
  extend: qx.ui.form.Button,

  statics: {
    _fileInputElementIdCounter: 0
  },

  events: {
    /**
     * The event is fired when the file selection changes.
     *
     * The method {@link qx.event.type.Data#getData} returns the
     * current [fileList](https://developer.mozilla.org/en-US/docs/Web/API/FileList)
     */
    changeFileSelection: "qx.event.type.Data"
  },

  properties: {
    /**
     * What type of files should be offered in the fileselection dialog.
     * Use a comma separated list of [Unique file type specifiers](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers). If you dont set anything, all files
     * are allowed.
     *
     * *Example*
     *
     * `.doc,.docx,application/msword`
     */
    accept: {
      nullable: true,
      check: "String",
      apply: "_applyAttribute"
    },

    /**
     * Specify that the camera should be used for getting the "file". The
     * value defines which camera should be used for capturing images.
     * `user` indicates the user-facing camera.
     * `environment` indicates the camera facing away from the user.
     */
    capture: {
      nullable: true,
      check: ["user", "environment"],
      apply: "_applyAttribute"
    },

    /**
     * Set to "true" if you want to allow the selection of multiple files.
     */
    multiple: {
      nullable: true,
      check: "Boolean",
      apply: "_applyAttribute"
    },

    /**
     * If present, indicates that only directories should be available for
     * selection.
     */
    directoriesOnly: {
      nullable: true,
      check: "Boolean",
      apply: "_applyAttribute"
    }
  },

  members: {
    __inputObject: null,

    _applyAttribute(value, old, attr) {
      if (attr === "directoriesOnly") {
        // while the name of the attribute indicates that this only
        // works for webkit browsers, this is not the case. These
        // days the attribute is supported by
        // [everyone](https://caniuse.com/?search=webkitdirectory).
        attr = "webkitdirectory";
      }
      this.__inputObject.setAttribute(attr, value);
    },

    /**
     * @param {Boolean} value
     * @return {Boolean}
     */
    setEnabled(value) {
      this.__inputObject.setEnabled(value);
      super.setEnabled(value);
    },

    _createContentElement() {
      let id =
        "qxFileSelector_" +
        ++qx.ui.form.FileSelectorButton._fileInputElementIdCounter;
      let input = (this.__inputObject = new qx.html.Input("file", null, {
        id: id
      }));

      let label = new qx.html.Element("label", {}, { for: id });
      label.addListenerOnce("appear", e => {
        label.add(input);
      });

      input.addListenerOnce("appear", e => {
        let inputEl = input.getDomElement();
        // since qx.html.Node does not even create the
        // domNode if it is not set to visible initially
        // we have to quickly hide it after creation.
        input.setVisible(false);
        inputEl.addEventListener("change", e => {
          this.fireDataEvent("changeFileSelection", inputEl.files);
          inputEl.value = "";
        });
      });
      return label;
    }
  }
});
