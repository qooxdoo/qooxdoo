package net.jsunit;

import net.jsunit.configuration.ConfigurationSource;

public class DummyConfigurationSource implements ConfigurationSource {

    public static final String DUMMY_URL = "http://www.example.com:1234/jsunit/runner?autoRun=true&submitResults=true";
    public static final String REMOTE_URL_1 = "http://my.machine.com:8080/jsunit";
    public static final String REMOTE_URL_2 = "http://your.machine.com:9090/jsunit";
    public static final String REMOTE_URL_3 = "http://his.machine.com:7070/jsunit";
    public static final String BROWSER_FILE_NAME = "mybrowser.exe";
    private boolean needs3rdRemoteMachineURL;

    public String resourceBase() {
        return ".";
    }

    public String port() {
        return "1234";
    }

    public String logsDirectory() {
        return "";
    }

    public String browserFileNames() {
        return BROWSER_FILE_NAME;
    }

    public String url() {
        return DUMMY_URL;
    }

    public String ignoreUnresponsiveRemoteMachines() {
        return "";
    }

    public String closeBrowsersAfterTestRuns() {
        return "true";
    }

    public String description() {
        return "This is my server!";
    }

    public String logStatus() {
        return "false";
    }

    public String timeoutSeconds() {
        return "60";
    }

    public String remoteMachineURLs() {
        String result = REMOTE_URL_1 + "," + REMOTE_URL_2;
        if (needs3rdRemoteMachineURL)
            result += ("," + REMOTE_URL_3);
        return result;
    }

    public void setNeeds3rdRemoteMachineURL() {
        this.needs3rdRemoteMachineURL = true;
    }

}