package net.jsunit;

import net.jsunit.model.ResultType;
import org.jdom.Document;

import java.net.URLEncoder;

public class RunnerFunctionalTest extends FunctionalTestCase {

    public void testSimple() throws Exception {
        webTester.beginAt("runner");
        Document result = responseXmlDocument();
        assertSuccessfulRunResult(
                result,
                ResultType.SUCCESS,
                "http://localhost:" + port + "/jsunit/tests/jsUnitUtilityTests.html", 2);
    }

    public void testOverrideUrl() throws Exception {
        webTester.beginAt("runner?url=" + URLEncoder.encode("http://127.0.0.1:" + port + "/jsunit/testRunner.html?testPage=http://127.0.0.1:" + port + "/jsunit/tests/jsUnitUtilityTests.html&autoRun=true&submitresults=true", "UTF-8"));
        Document result = responseXmlDocument();
        assertSuccessfulRunResult(
                result,
                ResultType.SUCCESS,
                "http://127.0.0.1:" + port + "/jsunit/tests/jsUnitUtilityTests.html", 2);
    }

    public void testSpecifyBrowser() throws Exception {
        webTester.beginAt("runner?browserId=0");
        Document result = responseXmlDocument();
        assertSuccessfulRunResult(
                result,
                ResultType.SUCCESS,
                "http://localhost:" + port + "/jsunit/tests/jsUnitUtilityTests.html", 1);
    }

    public void testSpecifyInvalidBrowser() throws Exception {
        webTester.beginAt("runner?browserId=23");
        Document result = responseXmlDocument();
        assertErrorResponse(result.getRootElement(), "Invalid browser ID: 23");
    }

    protected boolean shouldMockOutProcessStarter() {
        return false;
    }

}
