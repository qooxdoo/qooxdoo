package net.jsunit;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;
import net.jsunit.model.ResultType;
import net.jsunit.utility.SystemUtility;
import net.jsunit.utility.XmlUtility;
import org.jdom.Document;

public class ServerLandingPageFunctionalTest extends FunctionalTestCase {

    public void testSlash() throws Exception {
        webTester.beginAt("/");
        assertOnLandingPage();
        webTester.assertTextPresent(SystemUtility.osString());
        webTester.assertTextPresent(SystemUtility.hostname());
        webTester.assertTextPresent(SystemUtility.ipAddress());
        webTester.assertLinkPresentWithText(new FunctionalTestConfigurationSource(port).url());
    }

    public void testIndexDotJsp() throws Exception {
        webTester.beginAt("/index.jsp");
        assertOnLandingPage();
    }

    public void testConfigLink() throws Exception {
        webTester.beginAt("/");
        webTester.clickLink("config");
        assertConfigXml();
    }

    protected boolean shouldMockOutProcessStarter() {
        return false;
    }

    public void testRunnerForParticularBrowser() throws Exception {
        webTester.beginAt("/");
        webTester.setWorkingForm("runnerForm");
        webTester.selectOption("browserId", Browser.DEFAULT_SYSTEM_BROWSER);
        webTester.setFormElement("url", "http://localhost:" + port + "/jsunit/testRunner.html?testPage=http://localhost:" + port + "/jsunit/tests/jsUnitAssertionTests.html");
        webTester.submit();
        assertSuccessfulRunResult(
                responseXmlDocument(),
                ResultType.SUCCESS,
                "http://localhost:" + port + "/jsunit/tests/jsUnitAssertionTests.html",
                1
        );
    }

    public void testRunnerForAllBrowsers() throws Exception {
        webTester.beginAt("/");
        webTester.setWorkingForm("runnerForm");
        webTester.setFormElement("url", "http://localhost:" + port + "/jsunit/testRunner.html?testPage=http://localhost:" + port + "/jsunit/tests/jsUnitAssertionTests.html");
        webTester.submit();
        assertSuccessfulRunResult(
                responseXmlDocument(),
                ResultType.SUCCESS,
                "http://localhost:" + port + "/jsunit/tests/jsUnitAssertionTests.html",
                2
        );
    }

    public void testDisplayerForm() throws Exception {
        server.launchBrowserTestRun(new BrowserLaunchSpecification(new Browser(Browser.DEFAULT_SYSTEM_BROWSER, 0)));
        BrowserResult browserResult = new BrowserResult();
        String id = String.valueOf(System.currentTimeMillis());
        browserResult.setId(id);
        server.accept(browserResult);
        webTester.beginAt("/");
        webTester.setWorkingForm("displayerForm");
        webTester.setFormElement("id", id);
        webTester.selectOption("browserId", Browser.DEFAULT_SYSTEM_BROWSER);
        webTester.submit();
        assertEquals(XmlUtility.asString(new Document(browserResult.asXml())), webTester.getDialog().getResponseText());
    }

    private void assertOnLandingPage() {
        webTester.assertTitleEquals("JsUnit  Server");
    }

}
