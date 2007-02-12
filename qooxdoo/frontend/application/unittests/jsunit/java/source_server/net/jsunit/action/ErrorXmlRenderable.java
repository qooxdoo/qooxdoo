package net.jsunit.action;

import net.jsunit.XmlRenderable;
import org.jdom.Element;

public class ErrorXmlRenderable implements XmlRenderable {
    private String message;

    public ErrorXmlRenderable(String message) {
        this.message = message;
    }

    public Element asXml() {
        return new Element("error").setText(message);
    }
}
