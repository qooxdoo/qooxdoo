package net.jsunit.model;

import net.jsunit.utility.XmlUtility;
import org.jdom.Attribute;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;

import java.io.File;
import java.util.List;
import java.util.logging.Logger;

public class BrowserResultBuilder {

    private Logger logger = Logger.getLogger("net.jsunit");
    private BrowserSource browserSource;

    public BrowserResultBuilder(BrowserSource browserSource) {
        this.browserSource = browserSource;
    }

    public BrowserResult build(File file) {
        try {
            Document document = new SAXBuilder().build(file);
            return build(document);
        } catch (Exception e) {
            logger.severe("Failed to read file " + file + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public BrowserResult build(String string) {
        Document document = XmlUtility.asXmlDocument(string);
        return build(document);
    }

    @SuppressWarnings("unchecked")
    public BrowserResult build(Document document) {
        Element root = document.getRootElement();
        return build(root);
    }

    @SuppressWarnings("unchecked")
    public BrowserResult build(Element root) {
        BrowserResult result = new BrowserResult();
        if (failedToLaunch(root))
            result.setFailedToLaunch();
        else if (timedOut(root))
            result.setTimedOut();
        else if (externallyShutDown(root))
            result.setExternallyShutDown();
        updateWithHeaders(result, root);
        updateWithProperties(root.getChild(BrowserResultWriter.PROPERTIES), result);
        Element testCasesElement = root.getChild(BrowserResultWriter.TEST_CASES);
        if (testCasesElement != null) {
            List children = testCasesElement.getChildren(TestCaseResultWriter.TEST_CASE);
            updateWithTestCaseResults(children, result);
        }
        return result;
    }

    private boolean failedToLaunch(Element root) {
        Attribute failedToLaunchAttribute = root.getAttribute(BrowserResultWriter.FAILED_TO_LAUNCH);
        return failedToLaunchAttribute != null && failedToLaunchAttribute.getValue().equals(String.valueOf(true));
    }

    private boolean timedOut(Element root) {
        Attribute timedOutAttribute = root.getAttribute(BrowserResultWriter.TIMED_OUT);
        return timedOutAttribute != null && timedOutAttribute.getValue().equals(String.valueOf(true));
    }

    private boolean externallyShutDown(Element root) {
        Attribute externallyShutDownAttribute = root.getAttribute(BrowserResultWriter.EXTERNALLY_SHUT_DOWN);
        return externallyShutDownAttribute != null && externallyShutDownAttribute.getValue().equals(String.valueOf(true));
    }

    private void updateWithHeaders(BrowserResult result, Element element) {
        String id = element.getAttributeValue(BrowserResultWriter.ID);
        if (id != null)
            result.setId(id);
        String time = element.getAttributeValue(BrowserResultWriter.TIME);
        if (time != null)
            result.setTime(Double.parseDouble(time));
    }

    private void updateWithProperties(Element element, BrowserResult result) {
        for (Object child : element.getChildren()) {
            Element next = (Element) child;
            String key = next.getAttributeValue(BrowserResultWriter.PROPERTY_KEY);
            String value = next.getAttributeValue(BrowserResultWriter.PROPERTY_VALUE);

            if (BrowserResultWriter.JSUNIT_VERSION.equals(key))
                result.setJsUnitVersion(value);
            else if (BrowserResultWriter.BROWSER_ID.equals(key)) {
                int browserId = Integer.valueOf(value);
                Browser browser = browserSource.getBrowserById(browserId);
                result.setBrowser(browser);
            } else if (BrowserResultWriter.USER_AGENT.equals(key))
                result.setUserAgent(value);
            else if (BrowserResultWriter.REMOTE_ADDRESS.equals(key))
                result.setRemoteAddress(value);
            else if (BrowserResultWriter.URL.equals(key))
                result.setBaseURL(value);
            else if (BrowserResultWriter.SERVER_SIDE_EXCEPTION_STACK_TRACE.equals(key)) {
                String stackTrace = next.getText();
                result.setServerSideExceptionStackTrace(stackTrace);
            }
        }
    }

    private void updateWithTestCaseResults(List<Element> testCaseElements, BrowserResult result) {
        TestCaseResultBuilder testCaseBuilder = new TestCaseResultBuilder();
        for (Element element : testCaseElements) {
            result.addTestCaseResult(testCaseBuilder.build(element));
        }
    }
}
