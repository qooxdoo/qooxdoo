/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class is responsible for converting json data to class instances
 * including the creation of the classes.
 */
qx.Class.define("qx.data.marshal.Json",
{
  extend : qx.core.Object,
  implement : [qx.data.marshal.IMarshaler],

  /**
   * @param delegate {Object} An object containing one of the mehtods described
   *   in {@link qx.data.store.IStoreDelegate}.
   */
  construct : function(delegate)
  {
    this.base(arguments);

    this.__delegate = delegate;
  },

  statics :
  {
    __instance : null,

    /**
     * Creates a qooxdoo object based on the given json data. This function
     * is just a static wrapper. If you want to configure the creation
     * process of the class, use {@link qx.data.marshal.Json} directly.
     *
     * @param data {Object} The object for which classes should be created.
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     *
     * @return {qx.core.Object} An instance of the corresponding class.
     */
    createModel : function(data, includeBubbleEvents) {
      // singleton for the json marshaler
      if (this.__instance === null) {
        this.__instance = new qx.data.marshal.Json();
      }
      // be sure to create the classes first
      this.__instance.toClass(data, includeBubbleEvents);
      // return the model
      return this.__instance.toModel(data);
    }
  },


  members :
  {
    __delegate : null,


    /**
     * Converts a given object into a hash which will be used to identify the
     * classes under the namespace <code>qx.data.model</code>.
     *
     * @param data {Object} The JavaScript object from which the hash is
     *   requeired.
     * @return {String} The hash representation of the given JavaScript object.
     */
    __jsonToHash: function(data) {
      var properties = [];
      for (var key in data) {
        properties.push(key);
      }
      return properties.sort().join('"');
    },


    /**
     * Creates for the given data the needed classes. The classes contain for
     * every key in the data a property. The classname is always the prefix
     * <code>qx.data.model</code> and the hash of the data created by
     * {@link #__jsonToHash}. Two objects containing the same keys will not
     * create two different classes. The class creation process also supports
     * the functions provided by its delegate.
     *
     * @see qx.data.store.IStoreDelegate
     *
     * @param data {Object} The object for which classes should be created.
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     */
    toClass: function(data, includeBubbleEvents) {
      // break on all primitive json types
      if (
        qx.lang.Type.isNumber(data)
        || qx.lang.Type.isString(data)
        || qx.lang.Type.isBoolean(data)
        || data == null
      ) {
        return;
      }

      // check for arrays
      if (qx.lang.Type.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
          this.toClass(data[i], includeBubbleEvents);
        }
        // dont create an class for an array
        return;
      }

      var hash = this.__jsonToHash(data);

      // class is defined by the delegate
      if (
        this.__delegate
        && this.__delegate.getModelClass
        && this.__delegate.getModelClass(hash) != null
      ) {
        return;
      }

      // check for the possible child classes
      for (var key in data) {
        this.toClass(data[key], includeBubbleEvents);
      }

      // class already exists
      if (qx.Class.isDefined("qx.data.model." + hash)) {
        return;
      }

      // create the properties map
      var properties = {};
      for (var key in data) {
        // stip the unwanted characters
        key = key.replace("-", "");
        properties[key] = {};
        properties[key].nullable = true;
        properties[key].event = "change" + qx.lang.String.firstUp(key);
        if (includeBubbleEvents) {
          properties[key].apply = "_applyEventPropagation";
        }
      }

      // try to get the superclass, qx.core.Object as default
      if (this.__delegate && this.__delegate.getModelSuperClass) {
        var superClass =
          this.__delegate.getModelSuperClass(hash) || qx.core.Object;
      } else {
        var superClass = qx.core.Object;
      }

      // try to get the mixins
      var mixins = [];
      if (this.__delegate && this.__delegate.getModelMixins) {
        var delegateMixins = this.__delegate.getModelMixins(hash);
        // check if its an array
        if (!qx.lang.Type.isArray(delegateMixins)) {
          if (delegateMixins != null) {
            mixins = [delegateMixins];
          }
        }
      }

      // include the mixin for the event bubbling
      if (includeBubbleEvents) {
        mixins.push(qx.data.marshal.MEventBubbling);
      }

      // create the map for the class
      var newClass = {
        extend : superClass,
        include : mixins,
        properties : properties
      };

      qx.Class.define("qx.data.model." + hash, newClass);
    },


    /**
     * Creates an instance for the given data hash.
     *
     * @param hash {String} The hash of the data for which an instance should
     *   be created.
     * @return {qx.core.Object} An instance of the corresponding class.
     */
    __createInstance: function(hash) {
      var delegateClass;
      // get the class from the delegate
      if (this.__delegate && this.__delegate.getModelClass) {
        delegateClass = this.__delegate.getModelClass(hash);
      }
      if (delegateClass != null) {
        return (new delegateClass());
      } else {
        var clazz = qx.Class.getByName("qx.data.model." + hash);
        return (new clazz());
      }
    },


    /**
     * Creates for the given data the needed models. Be sure to have the classes
     * created with {@link #toClass} before calling this method. The creation
     * of the class itself is delegated to the {@link #__createInstance} method,
     * which could use the {@link qx.data.store.IStoreDelegate} methods, if
     * given.
     *
     * @param data {Object} The object for which models should be created.
     *
     * @return {qx.core.Object} The created model object.
     */
    toModel: function(data) {
      if (
        qx.lang.Type.isNumber(data)
        || qx.lang.Type.isString(data)
        || qx.lang.Type.isBoolean(data)
        || qx.lang.Type.isDate(data)
        || data == null
      ) {
        return data;

      } else if (qx.lang.Type.isArray(data)) {
        var array = new qx.data.Array();
        for (var i = 0; i < data.length; i++) {
          array.push(this.toModel(data[i]));
        }
        return array;

      } else if (qx.lang.Type.isObject(data)) {
        // create an instance for the object
        var hash = this.__jsonToHash(data);
        var model = this.__createInstance(hash);

        // go threw all element in the data
        for (var key in data) {
          var propertyName = key.replace("-", "");
          model["set" + qx.lang.String.firstUp(propertyName)](this.toModel(data[key]));
        }
        return model;
      }

      throw new Error("Unsupported type!");
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    this.__delegate = null;
  }
});
