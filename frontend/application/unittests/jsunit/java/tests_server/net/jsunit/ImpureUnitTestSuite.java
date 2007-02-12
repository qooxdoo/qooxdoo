package net.jsunit;

import junit.framework.Test;
import junit.framework.TestSuite;
import net.jsunit.action.DistributedTestRunnerActionTest;
import net.jsunit.action.FarmServerConfigurationActionTest;
import net.jsunit.action.TestRunnerActionSimultaneousRunBlockingTest;
import net.jsunit.action.TestRunnerActionTest;
import net.jsunit.configuration.ConfigurationSourceResolutionTest;
import net.jsunit.configuration.ConfigurationTest;
import net.jsunit.configuration.EnvironmentVariablesConfigurationSourceTest;
import net.jsunit.configuration.PropertiesConfigurationSourceTest;
import net.jsunit.interceptor.BrowserResultInterceptorTest;
import net.jsunit.interceptor.FarmServerInterceptorTest;
import net.jsunit.interceptor.RequestSourceInterceptorTest;
import net.jsunit.model.*;

public class ImpureUnitTestSuite {

    public static Test suite() {
        TestSuite result = new TestSuite();
        result.addTestSuite(BrowserResultInterceptorTest.class);
        result.addTestSuite(BrowserResultTest.class);
        result.addTestSuite(ClientServerInteractionTest.class);
        result.addTestSuite(ClientServerConnectionTest.class);
        result.addTestSuite(ConfigurationSourceResolutionTest.class);
        result.addTestSuite(ConfigurationTest.class);
        result.addTestSuite(DistributedTestRunResultBuilderTest.class);
        result.addTestSuite(DistributedTestSuiteBuilderTest.class);
        result.addTestSuite(EnvironmentVariablesConfigurationSourceTest.class);
        result.addTestSuite(ExternallyShutDownBrowserResultTest.class);
        result.addTestSuite(FailedToLaunchBrowserResultTest.class);
        result.addTestSuite(FarmServerConfigurationActionTest.class);
        result.addTestSuite(FarmServerInterceptorTest.class);
        result.addTestSuite(DistributedTestRunManagerTest.class);
        result.addTestSuite(DistributedTestRunnerActionTest.class);
        result.addTestSuite(JsUnitFarmServerTest.class);
        result.addTestSuite(JsUnitStandardServerTest.class);
        result.addTestSuite(PropertiesConfigurationSourceTest.class);
        result.addTestSuite(RemoteConfigurationSourceTest.class);
        result.addTestSuite(RemoteMachineRunnerHitterTest.class);
        result.addTestSuite(RemoteTestRunClientTest.class);
        result.addTestSuite(RequestSourceInterceptorTest.class);
        result.addTestSuite(ResultAcceptorTest.class);
        result.addTestSuite(TestRunnerActionSimultaneousRunBlockingTest.class);
        result.addTestSuite(TestRunNotifierServerTest.class);
        result.addTestSuite(TestRunResultBuilderTest.class);
        result.addTestSuite(TestRunManagerTest.class);
        result.addTestSuite(TestRunResultTest.class);
        result.addTestSuite(TestRunnerActionTest.class);
        result.addTestSuite(TimeoutCheckerTest.class);
        result.addTestSuite(TimedOutBrowerResultTest.class);
        return result;
    }
}
