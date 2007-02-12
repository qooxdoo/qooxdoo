package net.jsunit;

import junit.framework.Test;
import junit.framework.TestSuite;
import net.jsunit.action.ErrorXmlRenderableTest;
import net.jsunit.action.LatestVersionActionTest;
import net.jsunit.action.ResultAcceptorActionTest;
import net.jsunit.action.ResultDisplayerActionTest;
import net.jsunit.configuration.ArgumentsConfigurationSourceTest;
import net.jsunit.interceptor.BrowserTestRunnerInterceptorTest;
import net.jsunit.interceptor.RemoteRunnerHitterInterceptorTest;
import net.jsunit.interceptor.VersionGrabberInterceptorTest;
import net.jsunit.model.BrowserTest;
import net.jsunit.model.TestCaseResultTest;
import net.jsunit.model.TestPageResultTest;

public class PureUnitTestSuite {

    public static Test suite() {
        TestSuite result = new TestSuite();
        result.addTestSuite(ArgumentsConfigurationSourceTest.class);
        result.addTestSuite(BrowserLaunchSpecificationTest.class);
        result.addTestSuite(BrowserResultLogWriterTest.class);
        result.addTestSuite(BrowserTest.class);
        result.addTestSuite(BrowserTestRunnerInterceptorTest.class);
        result.addTestSuite(ErrorXmlRenderableTest.class);
        result.addTestSuite(DistributedTestRunResultTest.class);
        result.addTestSuite(LatestVersionActionTest.class);
        result.addTestSuite(RemoteRunnerHitterInterceptorTest.class);
        result.addTestSuite(ResultAcceptorActionTest.class);
        result.addTestSuite(ResultDisplayerActionTest.class);
        result.addTestSuite(TestCaseResultTest.class);
        result.addTestSuite(TestPageResultTest.class);
        result.addTestSuite(VersionGrabberInterceptorTest.class);
        return result;
    }
}
