/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019-22 Zenesis Ltd, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

/**
 * Controls serializing the VDOM in `qx.html.*` into an HTML string.
 *
 * The principal task here is to write the HTML with QxObjectIds, in a form which allows
 * the DOM that the browser parsed to be connected to the instances of `qx.html.Node`
 * that are created by the Javascript on the client.
 *
 * In other words, the DOM which is created by this HTML will be passed to `qx.html.Element.useNode`
 * on the client.
 */
qx.Class.define("qx.html.Serializer", {
  extend: qx.core.Object,

  /**
   * Constructor
   */
  construct() {
    super();
    this.__output = "";
    this.__objectStack = [];
    this.__tagDataStack = [];
  },

  properties: {
    /** Whether to pretty print (default is whatever qx.cdebug is set to) */
    prettyPrint: {
      init: qx.core.Environment.get("qx.debug"),
      check: "Boolean",
      nullable: false
    }
  },

  members: {
    /** @type{String} the HTML being built up */
    __output: null,

    /** @type{qx.html.Node[]} the stack of objects being written */
    __objectStack: null,

    /**
     * For each tag on the stack being emitted, we track the data in an object, nominally called TagData
     *
     * @typedef {Object} TagData
     * @property {Integer} indent how far this node is indented
     * @property {String} tagName the name of the tag
     * @property {Dictionary} attributes the attributes to set on the tag
     * @property {Boolean?} openTagWritten whether the open tag has been written
     * @property {Boolean?} closeTagWritten whether the close tag has been written
     */

    /** @type{TagData[]} the stack of elements being written */
    __tagDataStack: null,

    /** @type{String?} the current tag name */
    __currentTagName: null,

    /**
     * Writes to the output
     * @param  {var[]} args array of values to convert to strings and output
     */
    write(...args) {
      this.__output += args.join("");
    },

    /**
     * Called when an open tag needs to be emitted
     *
     * @param {String} tagName
     */
    openTag(tagName) {
      this.__flush();
      this.__tagDataStack.push({
        indent: this.__tagDataStack.length,
        tagName: tagName.toLowerCase(),
        attributes: {}
      });
    },

    /**
     * Called to add plain text into the output
     * @param {String?} text
     */
    rawTextInBody(text) {
      if (text !== null && text !== undefined) {
        this.__flush();
        this.write(text);
      }
    },

    /**
     * Called to close the current tag
     */
    closeTag() {
      this.__flush(true);
      this.__tagDataStack.pop();
    },

    /**
     * Adds an attribute to the current tag; cannot be done if body or children have been output
     *
     * @param {String} key the attribute name
     * @param {String?} value teh attribite value, if null the attribute will be deleted
     */
    setAttribute(key, value) {
      let tagData = this.__peekTagData();
      if (tagData.openTagWritten)
        throw new Error(
          "Cannot modify attributes after the opening tag has been written"
        );

      tagData.attributes[key] = value;
    },

    /**
     * Looks for the current tag
     *
     * @returns {TagData}
     */
    __peekTagData() {
      return this.__tagDataStack[this.__tagDataStack.length - 1];
    },

    /**
     * Flushes the tag into the output.  This will prevent further attributes etc from being emitted
     * and if `closeTag` is true then the tag is closed.  Handles self closing tags and indentation
     *
     * @param {Boolean} closeTag if we are flushing because the tag is being closed
     */
    __flush(closeTag) {
      let tagData = this.__peekTagData();
      if (!tagData) return;

      const indent = () => {
        if (this.isPrettyPrint()) {
          for (let i = 0; i < tagData.indent; i++) this.write("  ");
        }
      };

      if (!tagData.openTagWritten) {
        indent();
        let tmp = ["<" + tagData.tagName];
        for (let key in tagData.attributes) {
          let value = tagData.attributes[key];
          if (value !== null && value !== undefined)
            tmp.push(`${key}=${value}`);
        }
        this.write(tmp.join(" "));

        if (closeTag) {
          if (qx.html.Serializer.__SELF_CLOSING_TAGS[tagData.tagName])
            this.write("/>");
          else this.write("></" + tagData.tagName + ">");
          tagData.openTagWritten = true;
          tagData.closeTagWritten = true;
          if (this.isPrettyPrint()) this.write("\n");
        } else {
          this.write(">");
          if (this.isPrettyPrint()) this.write("\n");
          tagData.openTagWritten = true;
        }
      } else if (closeTag && !tagData.closeTagWritten) {
        indent();
        this.write(`</${tagData.tagName}>`);
        if (this.isPrettyPrint()) this.write("\n");
        tagData.closeTagWritten = true;
      }
    },

    /**
     * Erases all output
     */
    clear() {
      this.__output = "";
    },

    /**
     * Provides the accumulated output
     *
     * @returns {String}
     */
    getOutput() {
      return this.__output;
    },

    /**
     * Pushes the QxObject onto the stack
     *
     * @param {qx.core.Object} obj
     */
    pushQxObject(obj) {
      this.__objectStack.push(obj);
    },

    /**
     * Pops the topmost QxObject from the stack
     */
    popQxObject() {
      this.__objectStack.pop();
    },

    /**
     * Peeks the QxObject stack
     *
     * @returns {qx.core.Object}
     */
    peekQxObject() {
      return this.__objectStack[this.__objectStack.length - 1] || null;
    },

    /**
     * Calculates a Qx Object ID which is either relative to the root most element,
     * or is relative to it's owner.  This tries to be as concise as possible so that
     * the output HTML is as readable as possible
     *
     * The return is null if the object does not have an ID
     *
     * @param {qx.html.Element} obj
     * @returns {String?}
     */
    getQxObjectIdFor(obj) {
      if (!obj.getQxObjectId()) return null;

      // If we can make the ID relative to it's parent, then just use the shorter version.  This is
      //  not strictly necessary because we could use absolute paths everywhere, but it's a lot
      //  easier to read and understand, and consumes less bytes in the output
      let top = this.peekQxObject();
      if (top === obj) {
        let superTop =
          this.__objectStack[this.__objectStack.length - 2] || null;
        if (superTop === obj.getQxOwner()) {
          return obj.getQxObjectId();
        }
      }

      // Calculate the absolute path, relative to the top of the stack
      let ids = [];
      let topMost = this.__objectStack[0];
      for (let tmp = obj; tmp; tmp = tmp.getQxOwner()) {
        let owner = tmp.getQxOwner();

        // If it is the top, or not listed, then stop
        if (
          owner === topMost ||
          this.__objectStack.indexOf(tmp.getQxOwner()) < 0
        ) {
          ids.unshift(tmp.getQxObjectId());
          ids.unshift("??");
          break;
        }
        let id = tmp.getQxObjectId();
        ids.unshift(id);
      }

      let id = "/" + ids.join("/");
      return id;
    }
  },

  statics: {
    /** @type{Dictionary<String,Boolean>} list of self closing tags, in lowercase */
    __SELF_CLOSING_TAGS: null
  },

  /**
   * Populates statics
   */
  defer(statics) {
    statics.__SELF_CLOSING_TAGS = {};
    [
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
    ].forEach(function (tagName) {
      statics.__SELF_CLOSING_TAGS[tagName] = true;
    });
  }
});
