
/*!
  A class to generate a widget hierarchy from XML

  QxBuilder is not thread safe by design
  	- state information is stored at the instance level
  	- only use it from a single thread
*/
function QxBuilder(flags)
{
  QxTarget.call(this);

	// map<className, map<propertyName, function>>
	this._propertyEditors = {};

	this._registerDefaultPropertyEditors();

	// keep track of all created radioButtonManagers : map<string,QxRadioButtonManager>
	// ToDO this may be need to be made global - if the managers can be shared by other builder instances
	this._radioButtonManagers = {};

	// keep track of where we are up to within the XML document - to assist in debugging messages
	this._debugContext = [];

	this._flags = flags || {};

	// ensure the default flags are setup
	if (this._flags.strict == null) {
		// strick mode throws exceptions when
		//	* widget setters don't exist
		this._flags.strict = true;
	};

};

QxBuilder.extend(QxTarget, "QxBuilder");

/*
------------------------------------------------------------------------------------
  BUILD
------------------------------------------------------------------------------------
*/

/*!
	Asynchronous method - fetches XML data from the URL then delegates to build to process the xml
	Dispatches a QxEvent("done") after the hierarchy is built
*/
proto.buildFromUrl = function(parent, url) {
	var loader = new QxXmlHttpLoader();
	var self = this;
	loader.addEventListener("complete", function(e) {
		self.build(parent, e.getValue());
		e.preventDefault();
		self.dispatchEvent(new QxEvent("done"), true);
	});
	loader.load(url);
};

/*!
	parse the children of the xml and appending all widgets to the parent widget
	@param parent can either be the application instance, or a widget to append the xml toplevel widgets to
	@param node can be either a xml string, or a xml dom document or fragment
*/
proto.build = function(parent, node) {

		if (parent instanceof QxApplication) {
			parent = parent.getClientWindow().getDocument();
		};

		// support embedding of an XML string within a textarea
		if (typeof node == "object" && node.nodeName == 'TEXTAREA') {
			node = node.value;
		};

		// parse strings in to XML DOM
		if (typeof node == "string") {
			// TODO: support MSXML parser
			if (new QxClient().isMshtml()) {
				var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async=false;
				xmlDoc.loadXML(node);
				node = xmlDoc.documentElement;
				if (xmlDoc.parseError.errorCode != 0) {
				   throw new Error("error parsing xml " + xmlDoc.parseError + "\nLine:" + xmlDoc.parseError.line + ' : ' + xmlDoc.parseError.srcText);
				};
			}
			else {
				var parser = new DOMParser();
				node = parser.parseFromString(node, "text/xml").documentElement;
				// TODO handle parse errors
			};

		};
		this._buildNodes(parent, node.childNodes);

};

proto._buildNodes = function(parent, nodes) {
		var x = 0;
		for (var i = 0; i < nodes.length; i++) {
			var n = nodes[i];
			// 1 = ELEMENT_NODE
			if (n.nodeType == 1) {
					this._debugContext.push(n.nodeName+'['+(x++)+']');
					this._buildWidgetFromNode(parent, n);
					this._debugContext.pop();
			};
		};
};

proto._buildEventListener = function(widget, args, text) {

	if (isInvalidString(args.type)) {
		throw this._newBuildError('eventListener requires a string type attribute');
	};

	var self = this;

	// are we delegating ?
	if (isValidString(args.delegate)) {

		// remember the build context to be able to display it after built time
		var dc = this._formatDebugContext();

		if (args.delegate.indexOf('.') > -1) {
			// delegation to a global method
			var p = args.delegate.split('.');
			var o = p[0];
			var m = p[1];
			widget.addEventListener(args.type, function(e) {

					if (!window[o]) {
						throw self._newError(dc, 'delegate not found', {delegate:args.delegate});
					};

					if (!window[o][m]) {
						throw self._newError(dc, 'delegate not found', {delegate:args.delegate});
					};

					window[o][m].apply(window[o], [e]);
			});
		}
		else {

			// delegation to a global method
			widget.addEventListener(args.type, function(e) {

				if (!window[args.delegate]) {
					throw self._newError(dc, 'delegate not found', {delegate:args.delegate});
				};

				window[args.delegate].apply(null, [e]);
			});
		};
	}
	else {

		// build a function object using text as the function body
		//
		// the args attribute indicates the name of the event argument
		// if not provided - use 'event' as the name
		if (!args.args) {
			args.args = "event";
		};

		var f = new Function(args.args, text);
		widget.addEventListener(args.type, f);
	};
};


/*
	a node builder that will be used if no node builder is declared for a nodeName
*/
proto._buildWidgetFromNode = function(parent, node) {

	var className = this._extractClassName(node);

	if (!className) {
		if (parent instanceof QxAtom) {
			var text = this._serializeToString(node);
			parent.setText((parent.getText()||"") + text );
			return;
		};
		throw this._newBuildError("unrecognised node", {nodeName:node.nodeName});
	};

	if (className == "QxWidgets") {
		// generic container node to allow xml to contain multiple toplevel nodes
		this._buildNodes(parent, node.childNodes);
		return;
	};

	if (className == "QxScript") {
		var e = document.createElement("script");
		var attribs = this._mapXmlAttribToObject(node);
		if (attribs.type) {
			e.type = attribs.type;
		}
		else {
			e.type='text/javascript';
		};
		e.innerHTML = node.firstChild.nodeValue;
		document.body.appendChild(e);
		return;
	};

	if (className == "QxEventListener") {
		var attribs = this._mapXmlAttribToObject(node);
		var text;
		if (node.firstChild) {
			text = node.firstChild.nodeValue;
		};
		this._buildEventListener(parent, attribs, text);
		return;
	};

	var constructor = window[className];
	if (!constructor) {
		throw this._newBuildError("constructor not found", {className:className});
	};

	// construct the widget instance - using the default constructor
	var widget = new constructor();

//	this.debug('created ' + widget+'#'+widget._hash);

	var attribs = this._mapXmlAttribToObject(node, widget);

	delete attribs['qxtype'];

	if (attribs.id) {
		// register a global refrence for this widget
		window[attribs.id] = widget;
		delete attribs.id;
	};

	// convert any on??  attribs into event listeners
	for (var a in attribs) {

		if (a.toLowerCase().indexOf('on') == 0 && a.length > 2) {

			// there may be issues here for XHTML based attributes - due to their case
			var type = a.substring(2);
			type = type.charAt(0) + type.substring(1);

			this._buildEventListener(widget, {type:type,args:'event'}, attribs[a]);

			delete attribs[a];
		};
	};


	// handle special case of the parent being a QxLayout - need to get the layoutHint
	var layoutHint;
	if (typeof QxLayout != "undefined" && parent instanceof QxLayout) {

			// TODO : are layout hints mandatory - can this be determined through metadata ?
//		if (!attribs.layouthint) {
//			throw this._newBuildError('layoutHint is required when the parent component is a QxLayout');
//		};

		if (attribs.layouthint) {
			try {
				// TODO: validate the format of the attribute
				// TODO: is there a better way to do this ?
				eval('layoutHint = {' + attribs.layouthint + '}');
			}
			catch (e) {
				throw this._newBuildError('invalid property value', {name:'layoutHint',value:attrib.layoutHint}, e);
			};
			// remove the layoutHint attribute, since its has been processed
			delete attribs.layouthint;
		};
	};

	// process the rest of the attribs
	for (var n in attribs) {
		this._debugContext.push("@" + n);
		this._setWidgetProperty(widget, n, attribs[n]);
		this._debugContext.pop();
	};

	if (typeof QxMenu != "undefined" && widget instanceof QxMenu) {
		// add the widget to the document
		window.application.getClientWindow().getDocument().add(widget);
		// bind the widget to the menu
		parent.setMenu(widget);
	}
	else if (layoutHint && typeof QxLayout != "undefined" && parent instanceof QxLayout) {
			parent.add(widget, layoutHint);
	}
	else {
		parent.add(widget);
	};

	// recurse to all of the nodes children, using the newly created widget as the parent
	this._buildNodes(widget, node.childNodes);
};

/*
------------------------------------------------------------------------------------
  WIDGET PROPERTIES
------------------------------------------------------------------------------------
*/


/*!
	Set a widget's property using a propertyEditor
*/
proto._setWidgetProperty = function(widget, name, value) {
	var editor = this._findPropertyEditor(widget.classname, name);
	if (!editor) {
		editor = this._coercePropertyEditor;
	};
	editor.set(widget, name, value);
};

proto._findPropertyEditor = function(className, propertyName) {

	// get all defined propertyEditors for this widget's prototype
	var m = this._propertyEditors[className];
	// lookup the converter for this property name
	if (m && m[propertyName]) {
		return m[propertyName];
	};

	// try the widget's superclass
	var w = window[className];
	if (w && w.prototype.superclass && w.prototype.superclass.prototype.classname) {
		return this._findPropertyEditor(w.prototype.superclass.prototype.classname, propertyName);
	};

	return null;
};

proto.registerPropertyEditor = function(className, propertyName, editor) {
	if (!this._propertyEditors[className]) this._propertyEditors[className] = {};
	this._propertyEditors[className][propertyName] = editor;
};

proto._registerDefaultPropertyEditors = function() {
	var self = this;

	// a property editor that splits the values on a comma and coerces each one into a suitable type
	var commaDelimitedPropertyEditor = {};
	commaDelimitedPropertyEditor.set = function(widget, name, value) {
			if (value == null || value == "") {
				self._setProperty(widget, name, null);
				return;
			};

			var s = value.split(",");
			var v = [];
			for (var i = 0; i < s.length; i++) {
				v[i] = self._coerce(s[i]);
			};

			self._setProperties(widget, name, v);
	};

	var evalPropertyEditor = {};
	evalPropertyEditor.set = function(widget, name, value) {

			if (value == null || value == "") {
				self._setProperty(widget, name, null);
				return;
			};

			self._setProperty(widget, name, eval(value));
	};

	var radioButtonManagerEditor = {};
	radioButtonManagerEditor.set = function(widget, name, value) {

			var manager = self._radioButtonManagers[value];
			if (!manager) {
				manager = new QxRadioButtonManager(value);
				self._radioButtonManagers[value] = manager;
			};
			manager.add(widget);
	};

	this.registerPropertyEditor('QxWidget', 'location', commaDelimitedPropertyEditor);
	this.registerPropertyEditor('QxWidget', 'dimension', commaDelimitedPropertyEditor);
	this.registerPropertyEditor('QxWidget', 'styleproperty', commaDelimitedPropertyEditor);
	this.registerPropertyEditor('QxWidget', 'border', evalPropertyEditor);

	// create radioGroupManagers on demand, based on a string manager group name
	this.registerPropertyEditor('QxMenuRadioButton', 'group', radioButtonManagerEditor);
	this.registerPropertyEditor('QxRadioButton', 'group', radioButtonManagerEditor);

	// a property editor that just tries to coerce the string value into a suitable type
	this._coercePropertyEditor = {};
	this._coercePropertyEditor.set = function(widget, name, value) {
			self._setProperty(widget, name, self._coerce(value));
	};

};


proto._coerce = function(value) {

	// don't really care if its null
	if (value == null) return value;

	// is it alreay a javascript type
	if (typeof value == 'object') return value;
	if (typeof value == 'function') return value;
	if (typeof value == 'number') return value;
	if (typeof value == 'boolean') return value;
	if (typeof value == 'date') return value;
	if (typeof value == 'array') return value;

	// is it a number ?
	var n = new Number(value);
	if (!isNaN(n)) return n.valueOf();

	// is it a boolean ?
	if (value == "true") return true;
	if (value == "false") return false;

	// is it a date ?
	var d = Date.parse(value);
	if (d != null && !isNaN(d)) return d;

	// leave it as a string
	if (typeof value == 'string') {
		// convert empty string into null
		if (value == "") return null;
	};

	return value;
};

proto._setProperty = function(widget, name, value) {
	this._setProperties(widget, name, [value]);
};

proto._setProperties = function(widget, name, value) {

	// TODO : find a cheaper way to find the setter
	// NOTE : the name is LOWERCASE - hence we iterate all properties of the widget
	// 				to try and find a matching one

	var n = "set" + name;
	for (var a in widget) {
		if (n == a.toLowerCase()) {
			var setter = widget[a];
			break;
		};
	};
	if (!setter && this._flags.strict) throw this._newBuildError('no setter defined on widget instance', {widget:widget, property:name});
	setter.apply(widget, value);
};


/*
------------------------------------------------------------------------------------
  UTILS
------------------------------------------------------------------------------------
*/

proto._extractClassName = function(node) {

	var n;
	if (node.nodeName.toUpperCase() == "DIV") {
		if (!node.attributes['qxtype']) {
			return null
		};
		n = node.attributes['qxtype'].value;
	}
	else {
		n = node.nodeName;
	};

	var nameParts = n.split(":");
	if (nameParts.length != 2) {
		return null;
	};
	return nameParts[0].toFirstUp() + nameParts[1].toFirstUp();
};

proto._serializeToString = function(node) {

	// create serializer object
  var xmlSerializer = new XMLSerializer();
  // serialize
  return xmlSerializer.serializeToString(node);

};

proto._mapXmlAttribToObject = function(node) {
  var r = {};
  var c = node.attributes;
  for (var i=0; i<c.length; i++) {
		r[c[i].name.toLowerCase()] = c[i].value;
  };
  return r;
};

/*
------------------------------------------------------------------------------------
  EXCEPTION HANDLING / DEBUGGING
------------------------------------------------------------------------------------
*/

/*!
	the debugContext is only correct at build time
*/
proto._newBuildError = function(message, data, exception) {
	return this._newError(this._formatDebugContext(), message, data, exception);
};

proto._newError = function(debugContext, message, data, exception) {
	var m = message;
	var joiner = "";
	var d = "";
	if (data) {
		for (var p in data) {
			d += joiner + p + "=" + data[p] + '';
			joiner = " ";
		};
		m += " " + d + " ";
	};
	m += " context: " + debugContext + " ";
	if (exception) {
		m+= " error: " + exception + " ";
	};
	return new Error(m);
};

proto._formatDebugContext = function() {
	var s = "";
	for (var i = 0; i < this._debugContext.length; i++) {
		var v = this._debugContext[i];
		s += '/'+v;
	};
	return s;
};
