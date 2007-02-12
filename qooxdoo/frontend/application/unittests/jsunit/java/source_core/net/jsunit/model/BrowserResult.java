package net.jsunit.model;

import net.jsunit.XmlRenderable;
import net.jsunit.utility.StringUtility;
import org.jdom.Document;
import org.jdom.Element;

import java.util.ArrayList;
import java.util.List;

public class BrowserResult extends AbstractResult implements XmlRenderable {

    private Browser browser;
    private String remoteAddress;
    private String id;
    private String jsUnitVersion;
    private String userAgent;
    private String baseURL;
    private double time;
    private List<TestPageResult> testPageResults = new ArrayList<TestPageResult>();
    private String serverSideExceptionStackTrace;
    private ResultType resultType;

    public BrowserResult() {
        this.id = String.valueOf(System.currentTimeMillis());
    }

    public Browser getBrowser() {
        return browser;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        if (id != null)
            this.id = id;
    }

    public boolean hasId(String id) {
        return this.id.equals(id);
    }

    public String getJsUnitVersion() {
        return jsUnitVersion;
    }

    public void setJsUnitVersion(String jsUnitVersion) {
        this.jsUnitVersion = jsUnitVersion;
    }

    public String getBaseURL() {
        return baseURL;
    }

    public void setBaseURL(String baseURL) {
        this.baseURL = baseURL;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public double getTime() {
        return time;
    }

    public void setTime(double time) {
        this.time = time;
    }

    public List<TestCaseResult> getTestCaseResults() {
        List<TestCaseResult> result = new ArrayList<TestCaseResult>();
        for (TestPageResult pageResult : getTestPageResults())
            result.addAll(pageResult.getTestCaseResults());
        return result;
    }

    public void setTestCaseStrings(String[] testCaseResultStrings) {
        buildTestCaseResults(testCaseResultStrings);
    }

    public String getRemoteAddress() {
        return remoteAddress;
    }

    public void setRemoteAddress(String remoteAddress) {
        this.remoteAddress = remoteAddress;
    }

    private void buildTestCaseResults(String[] testCaseResultStrings) {
        if (testCaseResultStrings == null)
            return;
        for (String testCaseResultString : testCaseResultStrings)
            addTestCaseResult(TestCaseResult.fromString(testCaseResultString));
    }

    public Element asXml() {
        return new BrowserResultWriter(this).asXml();
    }

    public String asXmlFragment() {
        return new BrowserResultWriter(this).writeXmlFragment();
    }

    public void addTestCaseResult(TestCaseResult testCaseResult) {
        String testPageName = testCaseResult.getTestPageName();
        TestPageResult testPageResult = findTestPageResultForTestPageWithName(testPageName);
        if (testPageResult == null) {
            testPageResult = new TestPageResult(testPageName);
            testPageResults.add(testPageResult);
        }
        testPageResult.addTestCaseResult(testCaseResult);
    }

    private TestPageResult findTestPageResultForTestPageWithName(String testPageName) {
        for (TestPageResult testPageResult : testPageResults)
            if (testPageResult.getTestPageName().equals(testPageName))
                return testPageResult;
        return null;
    }

    public ResultType getResultType() {
        if (resultType == null)
            return super.getResultType();
        return resultType;
    }

    public Document asXmlDocument() {
        return new Document(asXml());
    }

    public List<TestPageResult> getTestPageResults() {
        return testPageResults;
    }

    public String getDisplayString() {
        return getResultType().getDisplayString();
    }

    public boolean completedTestRun() {
        return getResultType().completedTestRun();
    }

    public boolean timedOut() {
        return getResultType().timedOut();
    }

    public boolean failedToLaunch() {
        return getResultType().failedToLaunch();
    }

    public boolean externallyShutDown() {
        return getResultType().externallyShutDown();
    }

    public void setServerSideException(Throwable throwable) {
        serverSideExceptionStackTrace = StringUtility.stackTraceAsString(throwable);
    }

    public void setFailedToLaunch() {
        this.resultType = ResultType.FAILED_TO_LAUNCH;
    }

    public void setTimedOut() {
        this.resultType = ResultType.TIMED_OUT;
    }

    public void setExternallyShutDown() {
        this.resultType = ResultType.EXTERNALLY_SHUT_DOWN;
    }

    public String getServerSideExceptionStackTrace() {
        return serverSideExceptionStackTrace;
    }

    public void setServerSideExceptionStackTrace(String serverSideExceptionStackTrace) {
        this.serverSideExceptionStackTrace = serverSideExceptionStackTrace;
    }

    public boolean hasServerSideExceptionStackTrace() {
        return getServerSideExceptionStackTrace() != null;
    }

    protected List<? extends Result> getChildren() {
        return testPageResults;
    }

    public void setBrowser(Browser browser) {
        this.browser = browser;
    }

    public boolean isForBrowser(Browser browser) {
        return this.browser.equals(browser);
    }
}
