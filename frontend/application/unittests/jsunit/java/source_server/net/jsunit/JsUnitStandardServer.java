package net.jsunit;

import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ServerType;
import net.jsunit.logging.BrowserResultRepository;
import net.jsunit.logging.FileBrowserResultRepository;
import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;
import net.jsunit.utility.StringUtility;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class JsUnitStandardServer extends AbstractJsUnitServer implements BrowserTestRunner {

    private List<BrowserResult> results = new ArrayList<BrowserResult>();
    private List<TestRunListener> browserTestRunListeners = new ArrayList<TestRunListener>();

    private ProcessStarter processStarter = new DefaultProcessStarter();
    private LaunchTestRunCommand launchTestRunCommand;
    private TimeoutChecker timeoutChecker;
    private Process browserProcess;
    private long timeLastResultReceived;

    private BrowserResultRepository browserResultRepository;

    public JsUnitStandardServer(Configuration configuration, boolean temporary) {
        this(configuration, new FileBrowserResultRepository(configuration.getLogsDirectory()), temporary);
    }

    public JsUnitStandardServer(Configuration configuration, BrowserResultRepository browserResultRepository, boolean temporary) {
        super(configuration, temporary ? ServerType.STANDARD_TEMPORARY : ServerType.STANDARD);
        this.browserResultRepository = browserResultRepository;
        addBrowserTestRunListener(new BrowserResultLogWriter(browserResultRepository));
        ServerRegistry.registerServer(this);
    }

    public static void main(String args[]) {
        try {
            JsUnitStandardServer server = new JsUnitStandardServer(Configuration.resolve(args), false);
            server.start();
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    protected List<String> servletNames() {
        return Arrays.asList(new String[]{
                "acceptor",
                "config",
                "displayer",
                "index",
                "latestversion",
                "runner"
        });
    }

    public void accept(BrowserResult result) {
        long timeReceived = System.currentTimeMillis();
        if (launchTestRunCommand == null)
            return;
        Browser submittingBrowser = launchTestRunCommand.getBrowser();
        endBrowser();

        result.setBrowser(submittingBrowser);

        killTimeoutChecker();
        BrowserResult existingResultWithSameId = findResultWithId(result.getId(), submittingBrowser);
        for (TestRunListener listener : browserTestRunListeners)
            listener.browserTestRunFinished(submittingBrowser, result);
        if (existingResultWithSameId != null)
            results.remove(existingResultWithSameId);
        results.add(result);
        timeLastResultReceived = timeReceived;
    }

    private void killTimeoutChecker() {
        if (timeoutChecker != null) {
            timeoutChecker.die();
            timeoutChecker = null;
        }
    }

    public List<BrowserResult> getResults() {
        return results;
    }

    public void clearResults() {
        results.clear();
    }

    public BrowserResult findResultWithId(String id, int browserId) throws InvalidBrowserIdException {
        Browser browser = configuration.getBrowserById(browserId);
        if (browser == null)
            throw new InvalidBrowserIdException(browserId);
        return findResultWithId(id, browser);
    }

    private BrowserResult findResultWithId(String id, Browser browser) {
        BrowserResult result = findResultWithIdInResultList(id, browser);
        if (result == null)
            result = browserResultRepository.retrieve(id, browser);
        return result;
    }

    private BrowserResult findResultWithIdInResultList(String id, Browser browser) {
        for (BrowserResult result : getResults()) {
            if (result.hasId(id) && result.isForBrowser(browser))
                return result;
        }
        return null;
    }

    public BrowserResult lastResult() {
        List results = getResults();
        return results.isEmpty()
                ? null
                : (BrowserResult) results.get(results.size() - 1);
    }

    public int resultsCount() {
        return getResults().size();
    }

    public String toString() {
        return "JsUnit Server";
    }

    public List<Browser> getBrowsers() {
        return configuration.getBrowsers();
    }

    public boolean hasReceivedResultSince(long launchTime) {
        return timeLastResultReceived >= launchTime;
    }

    public void addBrowserTestRunListener(TestRunListener listener) {
        browserTestRunListeners.add(listener);
    }

    public List<TestRunListener> getBrowserTestRunListeners() {
        return browserTestRunListeners;
    }

    private void endBrowser() {
        if (browserProcess != null && configuration.shouldCloseBrowsersAfterTestRuns()) {
            if (launchTestRunCommand.getBrowserKillCommand() != null) {
                try {
                    processStarter.execute(new String[]{launchTestRunCommand.getBrowserKillCommand()});
                } catch (IOException e) {
                    e.printStackTrace();
                }
            } else {
                browserProcess.destroy();
                try {
                    browserProcess.waitFor();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                waitUntilProcessHasExitValue(browserProcess);
            }
        }
        browserProcess = null;
        launchTestRunCommand = null;
        killTimeoutChecker();
    }

    private void waitUntilProcessHasExitValue(Process browserProcess) {
        while (true) {
            try {
                if (browserProcess != null)
                    browserProcess.exitValue();
                return;
            } catch (IllegalThreadStateException e) {
            }
        }
    }

    public long launchBrowserTestRun(BrowserLaunchSpecification launchSpec) {
        waitUntilLastReceivedTimeHasPassed();
        long launchTime = System.currentTimeMillis();
        launchTestRunCommand = new LaunchTestRunCommand(launchSpec, configuration);
        Browser browser = launchTestRunCommand.getBrowser();
        String browserFileName = browser.getFileName();
        try {
            logStatus("Launching " + browserFileName + " on " + launchTestRunCommand.getTestURL());
            for (TestRunListener listener : browserTestRunListeners)
                listener.browserTestRunStarted(browser);
            this.browserProcess = processStarter.execute(launchTestRunCommand.generateArray());
            startTimeoutChecker(launchTime);
        } catch (Throwable throwable) {
            handleCrashWhileLaunching(throwable);
        }
        return launchTime;
    }

    private void handleCrashWhileLaunching(Throwable throwable) {
        Browser browser = launchTestRunCommand.getBrowser();
        logStatus("Browser " + browser.getFileName() + " failed to launch: " + StringUtility.stackTraceAsString(throwable));
        BrowserResult failedToLaunchBrowserResult = new BrowserResult();
        failedToLaunchBrowserResult.setFailedToLaunch();
        failedToLaunchBrowserResult.setBrowser(browser);
        failedToLaunchBrowserResult.setServerSideException(throwable);
        accept(failedToLaunchBrowserResult);
    }

    private void waitUntilLastReceivedTimeHasPassed() {
        while (System.currentTimeMillis() == timeLastResultReceived)
            try {
                Thread.sleep(1);
            } catch (InterruptedException e) {
            }
    }

    private void startTimeoutChecker(long launchTime) {
        timeoutChecker = new TimeoutChecker(browserProcess, launchTestRunCommand.getBrowser(), launchTime, this);
        timeoutChecker.start();
    }

    void setProcessStarter(ProcessStarter starter) {
        this.processStarter = starter;
    }

    public void startTestRun() {
        for (TestRunListener listener : browserTestRunListeners) {
            listener.testRunStarted();
            while (!listener.isReady())
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                }
        }
    }

    public void finishTestRun() {
        for (TestRunListener listener : browserTestRunListeners)
            listener.testRunFinished();
        testRunCount ++;
    }

    public Process getBrowserProcess() {
        return browserProcess;
    }

    public void dispose() {
        super.dispose();
        endBrowser();
    }

    protected String xworkXmlName() {
        return "xwork.xml";
    }

    public int timeoutSeconds() {
        return configuration.getTimeoutSeconds();
    }

    public boolean isAwaitingBrowserSubmission() {
        return launchTestRunCommand != null;
    }
}
