# Universal Object ID

On the surface, the Object ID mechanism is simple tool which allows you to attach IDs to any object 
that you create and then find those objects again by looking up the ID.  The Object ID mechanism also
supports parent/child relationships (called "owner" and "owned"), and this means that you can construct
a hierarchy of IDs and use them to uniquely identify specific objects, anywhere in your application.

The main benefits of using Object IDs are (a) better code organisation and adding an element of self
documentation to code, (b) documenting a structure and allowing that structure to be modified in derived
classes, and (c) external enumeration and retrieval of objects - for example, by automated
testing tools.


## Code Structure
Using Object IDs is easy, because the mechanism is built into every Qooxdoo object; all you need to do is to provide an implementation for `_createQxObjectImpl`:

```javascript
members: {
    _createQxObjectImpl(id) {
      switch(id) {
        case "someArray":
          return new qx.data.Array();
      }
      
      return super._createQxObjectImpl(id);
    }
```

Now you can call `this.getQxObject("someArray")` to get the array 
(you can call `getQxObject` as many times as you like with the same ID, 
and `_createQxObjectImpl` will only be called once).

As forms get more complex, so does the constructor; 
adding event listeners and other behaviour increase the size of the constructor 
and make it harder to read what exactly is going on. 
And as layout is redesigned, the order of the code in constructor becomes important 
because obviously you cannot register event listeners on objects that have not been created yet.

When those widgets need to be referenced by event handlers or other methods, 
you need to make sure that each one has a unique name, 
and/or is assigned to a unique member variable too. 
With this being the case, you are already assigning a unique ID to most of the objects that you create, 
the difference is that they are local and/or member variables rather than strings.

This rapidly makes the constructor become a big mix-up of UI code, layout code, 
and normal construction/setup code.  For example:

```javascript
construct() {
  super();
  const comp = new qx.ui.container.Composite();
  const edtLine1 = this.__edtLine1 = new qx.form.TextField();
  this._addToGroup(comp, edtLine1, "Line 1", "line1"); 

  const edtLine2 = this.__edtLine2 = new qx.form.TextField();
  this._addToGroup(comp, edtLine2, "Line 2", "line2"); 
  /* ... snip ... */

  const edtPostcode = this.__edtPostcode = new qx.form.TextField();
  this._addToGroup(comp, edtPostcode, "Postcode", "postcode"); 
  edtPostCode.addListener("changeValue", (evt) => {
    const str = evt.getData();
    const address = myapp.PostcodeValidator.lookup(str);
    if (address) {
      edtCountry.setValue(address.getCountry());
    }
  });
  // ... etc ...
}
```

As forms get larger it helps to break this out into a clearer style. 
Here's a real world example which uses the ID mechanism to achieve that:

```javascript
qx.Class.define("myapp.AddressEditor", {
  extend: myapp.Editor,

  construct() {
    super();
    this.add(this.getQxObject("comp"));
  },

  members: {
    _applyParentValue(value, oldValue) {
      super._applyParentValue(value, oldValue);
      
      // Access control is applied to objects by name
      this._setAccessControl(value, ["edtLine1", "edtLine2", "edtLine3", "edtCity", "edtCounty", "edtPostcode", 
        "edtCountry", "edtTelephone", "edtFax", "edtEmail" ]);
    },

    _createQxObjectImpl(id) {
      switch(id) {
      case "comp":
        var comp = new qx.ui.container.Composite();
        this._addToGroup(comp, "edtLine1", "Line 1", null, "line1");
        this._addToGroup(comp, "edtLine2", "Line 2", null, "line2");
        this._addToGroup(comp, "edtLine3", "Line 3", null, "line3");
        this._addToGroup(comp, "edtCity", "City", null, "city");
        this._addToGroup(comp, "edtCounty", "County", null, "county");
        this._addToGroup(comp, "edtPostcode", "Postcode", null, "postcode");
        this._addToGroup(comp, "edtCountry", "Country", null, "country");
        this._addToGroup(comp, "edtTelephone", "Main Telephone", null, "telephone");
        this._addToGroup(comp, "edtMobile", "Mobile/Alt Telephone", null, "mobile");
        this._addToGroup(comp, "edtFax", "Main Fax", null, "fax");
        this._addToGroup(comp, "edtEmail", "General Email", null, "email");
        const lay = comp.getLayout();
        lay.set({ spacingY: 3 });
        return comp;

      case "edtLine1":
      case "edtLine2":
      case "edtLine3":
      case "edtCity":
      case "edtCounty":
        return new qx.ui.form.TextField();

      case "edtPostcode":
        var edt = new qx.ui.form.TextField().set({ maxWidth: 150 });
        edtPostCode.addListener("changeValue", evt => {
          const str = evt.getData();
          const address = myapp.PostcodeValidator.lookup(str);
          if (address) {
            this.getWidget("edtCountry").setValue(address.getCountry());
          }
        });
        return edt;

      case "edtCountry":
        return new qx.ui.form.TextField().set({ maxWidth: 150 });

      case "edtTelephone":
      case "edtMobile":
      case "edtFax":
        return new qx.ui.form.TextField().set({ maxWidth: 150 });

      case "edtEmail":
        return new qx.ui.form.TextField();
      }

      return super._createQxObjectImpl(id);
    }
  }
});
```

Every widget becomes a member of the class, and although in this example they are all "public" 
there is nothing to prevent you using `_` or `__` prefixes to denote protected/private members. 
It's easy and natural to pass around ID strings instead of object instances, 
and it means that if you derive a class from this, 
the derived class can change the widget implementation completely just by overriding `_createObjectImpl`.  

The visual impact when reading code is great because you can see at a glance 
where widgets are and the constructor is much less cluttered. 
Syntax highlighting in many IDEs mean that the strings 
in `case "edtLine1":` lines are highlighted and draw your eye to the different controls 
at least as good as comments (without requiring an additional comment).

### Derived Classes
Using the example above, you can see that it is easy to create a derived class and override 
the `_createQxObjectImpl` method again, and intercept some of those IDs so 
that you can change the implementation of the object. 
This is by design, and in many ways the ObjectID mechanism forms an API of sorts.

In OO, the convention that Qooxdoo adopts is that protected members are prefixed 
with a single underscore and private members are prefixed with double underscore; 
the compiler will mangle private member names so 
that they are protected and cannot be called by derived classes, and the same happens 
with Object IDs. If you want to denote that the ID is protected or private, 
just use the `_` or `__` prefix in the ID, just as you would for member variables & methods.


## Finding Objects
If you want to find an object in the `this` object, 
just call `this.getQxObject("someId")`, but Object IDs also support 
a parent/child hierarchy - in ObjectID terms, the parent is called the "owner" 
and the child is called the "owned" object.

Let's say you're writing an e-commerce application, you might define something like this:

```javascript
qx.Class.define("myapp.InvoiceEditor", {
  extend: qx.core.Object,
  
  members: {
    _createQxObjectImpl(id) {
      switch(id) {
        case "deliveryAddressEditor":
          return new myapp.AddressEditor();
          
        case "tableInvoiceItems":
          return new qx.ui.table.Table();
        
        case "customerEditor":
          return new myapp.CustomerEditor();
      }
      return super(id);
    }
  }
});
qx.Class.define("myshop.CustomerEditor", {
  extend: qx.core.Object,
  
  members: {
    _createQxObjectImpl(id) {
      switch(id) {
        case "edtCustomerName":
          return new qx.ui.form.TextField();
        case "billingAddressEditor":
          return new myshop.AddressEditor();
      }
      return super._createQxObjectImpl(id);
    }
  }
});
```

Notice how the `myapp.AddressEditor` from an earlier example is used by both the `myapp.InvoiceEditor` and `myapp.CustomerEditor`.

If you want to find the customer name text field from the `InvoiceEditor`, this code would work:
```javascript
let invoiceEditor = new InvoiceEditor();
let textField = invoiceEditor.getQxObject("customerEditor/edtCustomerName");
```

### Registering objects - using Absolute IDs
While Object ID paths can be arbitrarily long, you always need one point to start searching 
from - you can implement your own mechanism for this, but Qooxdoo provides one in the form of `qx.core.Id`.

For example:

```javascript
// Assume that InvoicesEditorDialog is a dialog class, derived from qx.ui.window.Window, and which
// owns an instance of `myapp.InvoiceEditor`.
const dlgInvoiceEditor = new myapp.InvoiceEditorDialog();
qx.core.Id.registerObject(dlgInvoiceEditor, "dlgInvoiceEditor");
```

You (or your test suite) can find this dialog box widget from anywhere, just by 
calling `qx.core.Id.getQxObject("dlgInvoiceEditor")`.  As before, you could find 
the customer name text field by calling `qx.core.Id.getQxObject("dlgInvoiceEditor/invoiceEditor/customerEditor/edtCustomerName")`

An ID like this, where it starts with an object that is registered with 
`qx.core.Id.registerObject`, is called an Absolute Object ID, i.e. just like an "absolute path" 
on a filing system starts from the root of the disk.

If you ever need to find what the absolute ID would be for a given object, use `qx.core.Id.getAbsoluteIdOf`.

### Finding Objects via the DOM
Most automated testing tools won't know how to call Qooxdoo code to find an object with 
a specific ID because they are tuned to working with the DOM directly; 
to support them, any widget which can be found via `qx.core.Id.getQxObject()` will have an 
attribute added to the DOM element called `data-qx-object-id` which contains the Absolute 
Object ID (see above).


## Working Example - Event Recorder
There is a working example [of @cboulanger's Event Recorder](https://qooxdoo.org/qxl.packagebrowser/#cboulanger~eventrecorder~Demos~WidgetBrowser%20with%20autogenerated%20object%20ids%2C%20id%20tooltips%20and%20event%20recorder%2C%20showcasing%20the%20use%20of%20variables%20and%20macros) 
which demonstrates how events can be recorded and played back against a form.


## Child Controls
`qx.ui.core.Widget` objects have a similar mechanism for managing child controls - 
your custom widget is expected to override `_createChildControlImpl` and return whatever 
object (widget) is required.

While it is possible to use the childControl mechanism, that remains as a distinct solution 
from ObjectID because of a "separation of concerns" argument. 
Primarily, the object ID mechanism is a means to navigate application-level 
objects (aka business objects, etc.) from outside the application or component - this makes 
the IDs a form of published API that can expose a specific, designed structure, 
and as an "API" it needs to be clear and consistent. An API like this can be used by Selenium-type tools, 
or as part of the application's internal structure.

The `childControl` mechanism is tied into appearances and is a much lower level - when looking
at a `qx.ui.form.SelectBox`, it's comprised of a list, a button, a popup window, etc. - while
those objects are published within the context of just a SelectBox, they make little sense 
when it comes to application testing or finding application objects. 
ChildControls even have their own relationship with documentation 
(e.g. `@childControl` jsdoc tag), and just the term "control" implies some kind of visual aspect.

`childControl` and `objectId` are for distinctly different purposes 
(i.e. one is presentation layer and the other is data/business object layer) and 
should be kept separate. And if you do need to find a child control, there's no reason 
why you can't find the object via an `objectId` and then look 
inside it's `childControl` mechanism.

There is a potential cost to a parallel `objectId` mechanism, but it's very tiny - at most one 
additional map - but bear in mind that objects are not stored twice, just stored in one of 
two places (according to their purpose), so the cost is minimal. 
The PR includes the ability to turn off the `objectId` mechanism altogether 
via a `qx.core.Environment` setting.

