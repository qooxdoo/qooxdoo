package net.jsunit;

import net.jsunit.configuration.Configuration;
import net.jsunit.model.Browser;

public class LaunchTestRunCommand {

    private Configuration configuration;
    private BrowserLaunchSpecification launchSpec;

    public LaunchTestRunCommand(BrowserLaunchSpecification launchSpec, Configuration configuration) {
        this.configuration = configuration;
        this.launchSpec = launchSpec;
    }

    public Browser getBrowser() {
        return launchSpec.getBrowser();
    }

    public String getBrowserKillCommand() {
        String killCommand = launchSpec.getBrowser().getKillCommand();
        if (killCommand == null && launchSpec.isForDefaultBrowser()) {
            killCommand = PlatformType.resolve().getDefaultBrowserKillCommand();
        }
        return killCommand;
    }

    public String[] generateArray() throws NoUrlSpecifiedException {
        String[] browserCommandArray = openBrowserCommandArray();
        String[] commandWithUrl = new String[browserCommandArray.length + 1];
        System.arraycopy(browserCommandArray, 0, commandWithUrl, 0, browserCommandArray.length);
        commandWithUrl[browserCommandArray.length] = generateTestUrlString();
        return commandWithUrl;
    }

    private String[] openBrowserCommandArray() {
        if (launchSpec.isForDefaultBrowser()) {
            PlatformType platformType = PlatformType.resolve();
            return platformType.getDefaultCommandLineBrowserArray();
        }
        return new String[]{launchSpec.getBrowser().getFileName()};
    }

    private String generateTestUrlString() throws NoUrlSpecifiedException {
        if (!launchSpec.hasOverrideUrl() && configuration.getTestURL() == null)
            throw new NoUrlSpecifiedException();
        String urlString = launchSpec.hasOverrideUrl() ? launchSpec.getOverrideUrl() : configuration.getTestURL().toString();
        urlString = addAutoRunParameterIfNeeded(urlString);
        urlString = addSubmitResultsParameterIfNeeded(urlString);
        return urlString;
    }

    private String addSubmitResultsParameterIfNeeded(String urlString) {
        if (urlString.toLowerCase().indexOf("submitresults") == -1)
            urlString = addParameter(urlString, "submitResults=localhost:" + configuration.getPort() + "/jsunit/acceptor");
        return urlString;
    }

    private String addAutoRunParameterIfNeeded(String urlString) {
        if (urlString.toLowerCase().indexOf("autorun") == -1) {
            urlString = addParameter(urlString, "autoRun=true");
        }
        return urlString;
    }

    private String addParameter(String urlString, String paramAndValue) {
        if (urlString.indexOf("?") == -1)
            urlString += "?";
        else
            urlString += "&";
        urlString += paramAndValue;
        return urlString;
    }

    public String getTestURL() throws NoUrlSpecifiedException {
        return generateTestUrlString();
    }
}
