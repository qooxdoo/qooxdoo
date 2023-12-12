/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023 ZenesisUK https://www.zenesis.com/

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Will Johnson (WillsterJohnson)

************************************************************************ */

/**
 * The slot turns JSX from a syntax convenience into a declaratively expressive system.
 *
 * Passing children to a custom tag:
 * ```jsx
 * const MyFirstSlot = () => (
 *   <p>
 *     <slot />
 *   </p>
 * );
 *
 * const UseFirstSlot = (
 *   <MyFirstSlot>
 *     Lorem Ipsum Dolor Sit Amet
 *   </MyFirstSlot>
 * );
 * ```
 * Output:
 * ```html
 * <p>
 *   Lorem Ipsum Dolor Sit Amet
 * </p>
 * ```
 *
 * Declared children of the slot are the default children to use when no
 * children are passed or injected. Default children may be *any* valid JSX.
 *
 * Slots are named by passing a `name` attribute to the slot, and used by
 * passing a corresponding `slot` attribute to the child. In this way, slots
 * can be used to declare multiple remote children of the Custom Tag.
 */
qx.Class.define("qx.html.Slot", {
  extend: qx.html.Element,

  /**
   * Creates a new Slot
   *
   * @see constructor for {Element}
   */
  construct(slotName) {
    if (
      typeof slotName === "string" &&
      !slotName?.match(/^[a-zA-Z0-9\-\_]+$/)
    ) {
      throw new Error(
        `Slot name "${slotName}" is invalid! Slot names may only contain alphanumeric characters, hyphens, and underscores.`
      );
    }

    super("slot", {}, { name: slotName ?? qx.html.Slot.DEFAULT });
    this._defaultChildren = [];
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**@override */
    inject() {
      throw new Error(
        "Cannot inject into <slot>! Injections only work for the top-most element of a JSX expression."
      );
    },

    /**@override */
    _serializeImpl(serializer) {
      serializer.openTag(this._nodeName);
      serializer.pushQxObject(this);

      let id = serializer.getQxObjectIdFor(this);
      if (id) {
        serializer.setAttribute("data-qx-object-id", `"${id}"`);
      }

      // Children
      if (this._children?.length) {
        for (var i = 0; i < this._children.length; i++) {
          this._children[i]._serializeImpl(serializer);
        }
      } else {
        for (var i = 0; i < this._defaultChildren.length; i++) {
          this._defaultChildren[i]._serializeImpl(serializer);
        }
      }
      serializer.closeTag();
      serializer.popQxObject(this);
    },

    /*
    ---------------------------------------------------------------------------
      SLOT API
    ---------------------------------------------------------------------------
    */

    _defaultChildren: null,

    /**
     * @returns {ReadonlyArray<qx.html.Node>} The default children of this slot
     */
    getDefaultChildren() {
      return this._defaultChildren;
    },

    addDefaultChild(child) {
      try {
        this._defaultChildren.push(child);
      } catch (e) {
        throw new Error(
          "Cannot modify default children of <slot> outside of declaration!"
        );
      }
    },

    sealDefaultChildren() {
      Object.seal(this._defaultChildren);
    },

    getName() {
      return this.getAttribute("name");
    }
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics: {
    DEFAULT: Symbol("qx.html.Slot.DEFAULT")
  }
});
