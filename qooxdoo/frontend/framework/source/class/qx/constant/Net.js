/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)
#require(qx.OO)

************************************************************************ */

qx.OO.defineClass("qx.constant.Net",
{
  NAMESPACE_SVG : "http:/" + "/www.w3.org/2000/svg",
  NAMESPACE_SMIL : "http:/" + "/www.w3.org/2001/SMIL20/",
  NAMESPACE_MML : "http:/" + "/www.w3.org/1998/Math/MathML",
  NAMESPACE_CML : "http:/" + "/www.xml-cml.org",
  NAMESPACE_XLINK : "http:/" + "/www.w3.org/1999/xlink",
  NAMESPACE_XHTML : "http:/" + "/www.w3.org/1999/xhtml",
  NAMESPACE_XUL : "http:/" + "/www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
  NAMESPACE_XBL : "http:/" + "/www.mozilla.org/xbl",
  NAMESPACE_FO : "http:/" + "/www.w3.org/1999/XSL/Format",
  NAMESPACE_XSL : "http:/" + "/www.w3.org/1999/XSL/Transform",
  NAMESPACE_XSLT : "http:/" + "/www.w3.org/1999/XSL/Transform",
  NAMESPACE_XI : "http:/" + "/www.w3.org/2001/XInclude",
  NAMESPACE_XFORMS : "http:/" + "/www.w3.org/2002/01/xforms",
  NAMESPACE_SAXON : "http:/" + "/icl.com/saxon",
  NAMESPACE_XALAN : "http:/" + "/xml.apache.org/xslt",
  NAMESPACE_XSD : "http:/" + "/www.w3.org/2001/XMLSchema",
  NAMESPACE_DT: "http:/" + "/www.w3.org/2001/XMLSchema-datatypes",
  NAMESPACE_XSI : "http:/" + "/www.w3.org/2001/XMLSchema-instance",
  NAMESPACE_RDF : "http:/" + "/www.w3.org/1999/02/22-rdf-syntax-ns#",
  NAMESPACE_RDFS : "http:/" + "/www.w3.org/2000/01/rdf-schema#",
  NAMESPACE_DC : "http:/" + "/purl.org/dc/elements/1.1/",
  NAMESPACE_DCQ: "http:/" + "/purl.org/dc/qualifiers/1.0",
  NAMESPACE_SOAPENV : "http:/" + "/schemas.xmlsoap.org/soap/envelope/",
  NAMESPACE_WSDL : "http:/" + "/schemas.xmlsoap.org/wsdl/",
  NAMESPACE_ADOBESVGEXTENSIONS : "http:/" + "/ns.adobe.com/AdobeSVGViewerExtensions/3.0/",

  STATE_CREATED : "created",
  STATE_CONFIGURED : "configured",
  STATE_QUEUED : "queued",
  STATE_SENDING : "sending",
  STATE_RECEIVING : "receiving",
  STATE_COMPLETED : "completed",
  STATE_ABORTED : "aborted",
  STATE_FAILED : "failed",
  STATE_TIMEOUT : "timeout",

  PROTOCOL_HTTP : "http",
  PROTOCOL_HTTPS : "https",
  PROTOCOL_FTP : "ftp",
  PROTOCOL_FILE : "file",

  URI_HTTP : "http:/" + "/",
  URI_HTTPS : "https:/" + "/",
  URI_FTP : "ftp:/" + "/",
  URI_FILE : "file:/" + "/",

  METHOD_GET : "GET",
  METHOD_POST : "POST",
  METHOD_PUT : "PUT",
  METHOD_HEAD : "HEAD",
  METHOD_DELETE : "DELETE"
});
