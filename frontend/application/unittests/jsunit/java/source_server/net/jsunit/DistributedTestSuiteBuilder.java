package net.jsunit;

import junit.framework.TestSuite;
import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.configuration.DelegatingConfigurationSource;
import net.jsunit.model.Browser;

import java.net.URL;
import java.util.List;

public class DistributedTestSuiteBuilder {
    private ConfigurationSource localeSource;
    private RemoteServerHitter hitter;
    private Configuration localConfiguration;
    private int browserCount;

    public DistributedTestSuiteBuilder(ConfigurationSource localSource) {
        this(localSource, new RemoteMachineServerHitter());
    }

    public DistributedTestSuiteBuilder(ConfigurationSource localSource, RemoteServerHitter hitter) {
        this.localeSource = localSource;
        this.hitter = hitter;
        this.localConfiguration = new Configuration(localeSource);
    }

    public void addTestsTo(TestSuite suite) {
        for (final URL remoteMachineURL : localConfiguration.getRemoteMachineURLs()) {
            ConfigurationSource remoteSource = new RemoteConfigurationSource(hitter, remoteMachineURL.toString());
            Configuration remoteConfiguration = new Configuration(remoteSource);
            addTestsForRemoteConfigurationTo(remoteConfiguration, remoteMachineURL, suite);
        }
        suite.setName("JsUnit Tests (" + getRemoteMachineURLCount() + " machines, " + getBrowserCount() + " direct browsers)");
    }

    private void addTestsForRemoteConfigurationTo(Configuration remoteConfiguration, URL remoteMachineURL, TestSuite suite) {
        List<Browser> browsers = remoteConfiguration.getBrowsers();
        if (browsers.isEmpty()) {
            DistributedTest distributedTest = createDistributedTest(localeSource, remoteMachineURL);
            suite.addTest(distributedTest);
        } else {
            TestSuite suiteForRemoteMachine = new TestSuite(remoteMachineURL.toString());
            for (Browser browser : browsers) {
                browserCount++;
                DistributedTest distributedTest = createDistributedTest(localeSource, remoteMachineURL);
                distributedTest.limitToBrowser(browser);
                suiteForRemoteMachine.addTest(distributedTest);
            }
            suite.addTest(suiteForRemoteMachine);
        }
    }

    private DistributedTest createDistributedTest(ConfigurationSource originalSource, final URL remoteMachineURL) {
        return new DistributedTest(
                originalSource,
                new DelegatingConfigurationSource(originalSource) {
                    public String remoteMachineURLs() {
                        return remoteMachineURL.toString();
                    }
                }
        );
    }

    public int getRemoteMachineURLCount() {
        return localConfiguration.getRemoteMachineURLs().size();
    }

    public int getBrowserCount() {
        return browserCount;
    }
}
