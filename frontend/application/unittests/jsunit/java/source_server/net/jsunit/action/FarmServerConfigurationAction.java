package net.jsunit.action;

import net.jsunit.XmlRenderable;
import org.jdom.CDATA;
import org.jdom.Document;
import org.jdom.Element;

import java.io.IOException;
import java.net.URL;

public class FarmServerConfigurationAction extends JsUnitFarmServerAction {

    private Element result;

    public String execute() throws Exception {
        result = new Element("remoteConfigurations");
        for (URL url : server.getConfiguration().getRemoteMachineURLs()) {
            URL configurationURL = new URL(url.toString() + "/config");
            Element configurationElement;
            try {
                Document document = hitter.hitURL(configurationURL);
                configurationElement = document.getRootElement();
                configurationElement.detach();
            } catch (IOException e) {
                configurationElement = new Element("configuration");
                configurationElement.setAttribute("failedToConnect", String.valueOf(true));
                configurationElement.addContent(new CDATA(e.toString()));
            }

            addRemoteConfigurationElementToResult(url, configurationElement);
        }
        return SUCCESS;
    }

    private void addRemoteConfigurationElementToResult(URL remoteMachineURL, Element configurationElement) {
        Element remoteConfigurationElement = new Element("remoteConfiguration");
        remoteConfigurationElement.setAttribute("remoteMachineURL", remoteMachineURL.toString());
        remoteConfigurationElement.addContent(configurationElement);
        result.addContent(remoteConfigurationElement);
    }

    public XmlRenderable getXmlRenderable() {
        return new XmlRenderable() {

            public Element asXml() {
                return result;
            }

        };
    }

}
