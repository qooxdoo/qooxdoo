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
 * The FileSelectionButton opens a window and lets the user pick one or several
 * files from the local filesystem. A handle is returned which allows access
 * to the content of the file from javascript. The file can now be processed
 * in javascript, or it can also be uploaded to a server.
 * 
 * *Example*
 *
 * Post the content of the file to the server.
 * 
 * ```javascript
 * let button = new qx.ui.form.FileSelectorButton("Select File");
 * button.addListener('changeFileSelection',function(e){
 * let fileList = e.getData();
 *     let form = new FormData();
 *     form.append('file',fileList[0]);
 *     let req = new qx.io.request.Xhr("upload",'POST').set({
 *         requestData: form
 *     });
 *     req.addListener('success',(e) => {
 *         let response = req.getResponse();
 *     });
 * });
 *
 * [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file)
 */

qx.Class.define("qx.ui.form.FileSelectorButton", {
  extend : qx.ui.form.Button,
  statics: {
    ID_CNTR: 0
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
      apply : "_applyAttribute"
    },
    /**
     * Specify that the camera should be used for getting the "file". The
     * value defines which camera should be used for capturing images. 
     * `user` is indicates the user-facing camera. 
     * `environment` indicates the camera facing away from the user.
     */
    capture: {
      nullable: true,
      apply : "_applyAttribute"
    },
    /**
     * Set to "true" if you want to allow the selection of multiple files.
     */
    multiple: {
      nullable: true,
      apply : "_applyAttribute"
    },
    /**
     * If present, indicates that only directories should be available for
     * selection. Despite the name, this attribute is supported by [all
     * major browsers](https://caniuse.com/?search=webkitdirectory) 
     * these days (not IE!).
     */
    webkitdirectory: {
      nullable: true,
      apply : "_applyAttribute"
    }
  },
  members: {
    __inputObject: null,

    _applyAttribute: function(value,old,attr){
      this.__inputObject.setAttribute(attr,value);
    },
    
    _createContentElement: function() {
      let id = 'qxFileSelector_'+(this.constructor.ID_CNTR++);
      let input = this.__inputObject 
        = new qx.html.Input("file",{display: 'none'},{id: id});
      let label = new qx.html.Element("label",{},{'for': id});
      label.addListenerOnce('appear',function(e){
        label.add(input);
      },this);
      input.addListenerOnce('appear', (e) => {
        let inputEl = input.getDomElement();
        inputEl.addEventListener('change',(e) => {
          this.fireDataEvent('changeFileSelection',inputEl.files);
          inputEl.value = "";
        });
      });
      return label;
    }
  }
});