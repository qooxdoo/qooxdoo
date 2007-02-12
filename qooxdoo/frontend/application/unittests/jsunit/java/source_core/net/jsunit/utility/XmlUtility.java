package net.jsunit.utility;

import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.jdom.output.Format;
import org.jdom.output.XMLOutputter;

import java.io.StringReader;

public class XmlUtility {

    public static String asString(Element element) {
        return new XMLOutputter().outputString(element);
    }

    public static String asPrettyString(Element element) {
        return new XMLOutputter(Format.getPrettyFormat()).outputString(element);
    }

    public static String asString(Document document) {
        return new XMLOutputter().outputString(document);
    }

    public static Document asXmlDocument(String xmlDocumentString) {
        try {
            return new SAXBuilder().build(new StringReader(xmlDocumentString));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
