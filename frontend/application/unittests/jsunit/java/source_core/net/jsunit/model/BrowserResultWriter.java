package net.jsunit.model;

import org.jdom.CDATA;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

public class BrowserResultWriter {

    public static final String
            ID = "id",
            BROWSER_RESULT = "browserResult",
            BROWSER_FILE_NAME = "browserFileName",
            BROWSER_ID = "browserId",
            USER_AGENT = "userAgent",
            TIME = "time",
            TEST_CASES = "testCases",
            TEST_CASE = "testCase",
            TIMED_OUT = "timedOut",
            FAILED_TO_LAUNCH = "failedToLaunch",
            EXTERNALLY_SHUT_DOWN = "externallyShutDown",
            JSUNIT_VERSION = "jsUnitVersion",
            REMOTE_ADDRESS = "remoteAddress",
            SERVER_SIDE_EXCEPTION_STACK_TRACE = "serverSideExceptionStackTrace",
            PROPERTIES = "properties",
            PROPERTY = "property",
            PROPERTY_KEY = "name",
            PROPERTY_VALUE = "value",
            URL = "url";

    BrowserResult browserResult;

    public BrowserResultWriter(BrowserResult result) {
        this.browserResult = result;
    }

    public String writeXml() {
        Element root = createRootElement();
        Document document = new Document(root);
        return new XMLOutputter().outputString(document);
    }

    public String writeXmlFragment() {
        return new XMLOutputter().outputString(createRootElement());
    }

    private Element createRootElement() {
        Element root = new Element(BROWSER_RESULT);
        if (browserResult.timedOut())
            root.setAttribute(TIMED_OUT, String.valueOf(true));
        if (browserResult.failedToLaunch())
            root.setAttribute(FAILED_TO_LAUNCH, String.valueOf(true));
        if (browserResult.externallyShutDown())
            root.setAttribute(EXTERNALLY_SHUT_DOWN, String.valueOf(true));
        addPropertiesElementTo(root);
        if (browserResult.completedTestRun()) {
            root.setAttribute(ID, browserResult.getId());
            root.setAttribute(TIME, String.valueOf(browserResult.getTime()));
            addTestCasesElementTo(root);
        }
        return root;
    }

    private void addPropertiesElementTo(Element element) {
        Element properties = new Element(PROPERTIES);
        element.addContent(properties);

        Browser browser = browserResult.getBrowser();
        if (browser != null) {
            addProperty(properties, BROWSER_FILE_NAME, browser.getFileName());
            addProperty(properties, BROWSER_ID, String.valueOf(browserResult.getBrowser().getId()));
        }
        if (browserResult.completedTestRun()) {
            addProperty(properties, JSUNIT_VERSION, browserResult.getJsUnitVersion());
            addProperty(properties, USER_AGENT, browserResult.getUserAgent());
            addProperty(properties, REMOTE_ADDRESS, browserResult.getRemoteAddress());
            addProperty(properties, URL, browserResult.getBaseURL());
        }
        if (browserResult.hasServerSideExceptionStackTrace()) {
            Element stackTrace = createPropertyElement(SERVER_SIDE_EXCEPTION_STACK_TRACE);
            stackTrace.addContent(new CDATA(browserResult.getServerSideExceptionStackTrace()));
            properties.addContent(stackTrace);
        }
    }

    private void addProperty(Element parent, String name, String value) {
        Element property = createPropertyElement(name);
        property.setAttribute(PROPERTY_VALUE, value == null ? "" : value);
        parent.addContent(property);
    }

    private Element createPropertyElement(String name) {
        Element property = new Element(PROPERTY);
        property.setAttribute(PROPERTY_KEY, name);
        return property;
    }

    private void addTestCasesElementTo(Element element) {
        Element testCasesElement = new Element(TEST_CASES);
        for (TestCaseResult result : browserResult.getTestCaseResults()) {
            new TestCaseResultWriter(result).addXmlTo(testCasesElement);
        }
        element.addContent(testCasesElement);
    }

    public String writeProblems() {
        StringBuffer buffer = new StringBuffer();
        for (TestCaseResult result : browserResult.getTestCaseResults()) {
            if (!result.wasSuccessful()) {
                if (buffer.length() > 0)
                    buffer.append("\n");
                String problemMessage = result.getProblemSummary();
                buffer.append(problemMessage);
            }
        }
        return buffer.toString();
    }

    public Element asXml() {
        return createRootElement();
    }
}
