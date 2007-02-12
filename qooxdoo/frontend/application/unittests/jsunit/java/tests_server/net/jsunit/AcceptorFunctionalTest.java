package net.jsunit;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;
import net.jsunit.model.BrowserResultWriter;
import net.jsunit.utility.XmlUtility;
import org.jdom.Document;

public class AcceptorFunctionalTest extends FunctionalTestCase {

    public void testSubmission() throws Exception {
        server.launchBrowserTestRun(new BrowserLaunchSpecification(new Browser(Browser.DEFAULT_SYSTEM_BROWSER, 0)));

        StringBuffer buffer = new StringBuffer();
        addParameter(buffer, BrowserResultWriter.ID, "ID_foo", true);
        addParameter(buffer, BrowserResultWriter.USER_AGENT, "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)", false);
        addParameter(buffer, BrowserResultWriter.TIME, "4.3", false);
        addParameter(buffer, BrowserResultWriter.JSUNIT_VERSION, "12.5", false);
        addParameter(buffer, BrowserResultWriter.TEST_CASES, "/dummy/path/dummyPage.html:testFoo|1.3|S||", false);

        webTester.beginAt("acceptor" + buffer.toString());

        BrowserResult result = new BrowserResult();
        result.setId("ID_foo");
        result.setBrowser(new Browser(Browser.DEFAULT_SYSTEM_BROWSER, 0));
        result.setUserAgent("Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)");
        result.setTime(4.3);
        result.setJsUnitVersion("12.5");
        result.setTestCaseStrings(new String[]{"/dummy/path/dummyPage.html:testFoo|1.3|S||"});
        result.setRemoteAddress("127.0.0.1");

        assertEquals(XmlUtility.asString(new Document(result.asXml())), webTester.getDialog().getResponseText());
    }

    private void addParameter(StringBuffer buffer, String key, String value, boolean isFirst) {
        if (isFirst)
            buffer.append("?");
        else
            buffer.append("&");
        buffer.append(key);
        buffer.append("=");
        buffer.append(value);
    }

}
