/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2022 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

qx.Interface.define(
  "qx.core.propertystorage.IStorage",
  {
    // Interfaces can't define requirements for static functions.
    // These are listed here as documentation of the static functions
    // that must be implemented in property storage classes.
    statics :
    {
      init(prop, property, clazz)
      {
      },

      get(prop)
      {
      },

      set(prop, value)
      {
      },

      dereference(prop, property)
      {
      }
    }
  });
