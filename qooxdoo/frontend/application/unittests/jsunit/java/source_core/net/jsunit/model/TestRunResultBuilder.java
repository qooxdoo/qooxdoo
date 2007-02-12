package net.jsunit.model;

import org.jdom.Document;
import org.jdom.Element;

import java.util.List;

@SuppressWarnings({"unchecked"})
public class TestRunResultBuilder {

    public static final String NAME = "testRunResult";

    private BrowserSource browserSource;

    public TestRunResultBuilder(BrowserSource browserSource) {
        this.browserSource = browserSource;
    }

    public TestRunResult build(Document document) {
        TestRunResult result = new TestRunResult();
        Element propertiesElement = document.getRootElement().getChild("properties");
        if (propertiesElement != null)
            updateWithProperties(result, propertiesElement.getChildren());
        updateWithBrowserResults(document, result);
        return result;
    }

    private void updateWithBrowserResults(Document document, TestRunResult result) {
        BrowserResultBuilder browserBuilder = new BrowserResultBuilder(browserSource);
        List<Element> children = document.getRootElement().getChildren("browserResult");
        for (Element element : children) {
            BrowserResult browserResult = browserBuilder.build(element);
            result.addBrowserResult(browserResult);
        }
    }

    private void updateWithProperties(TestRunResult result, List<Element> properties) {
        for (Element propertyElement : properties) {
            String name = propertyElement.getAttribute("name").getValue();
            String value = propertyElement.getAttribute("value").getValue();
            if (name.equals("os"))
                result.setOsString(value);
            else if (name.equals("ipAddress"))
                result.setIpAddress(value);
            else if (name.equals("hostname"))
                result.setHostname(value);
        }
    }

}
