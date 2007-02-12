package net.jsunit.action;

import junit.framework.TestCase;

public class TestRunnerActionSimultaneousRunBlockingTest extends TestCase {
    private BlockingTestRunner runner;
    private TestRunnerAction action1;
    private TestRunnerAction action2;

    protected void setUp() throws Exception {
        super.setUp();
        runner = new BlockingTestRunner();
        action1 = new TestRunnerAction();
        action1.setBrowserTestRunner(runner);
        action2 = new TestRunnerAction();
        action2.setBrowserTestRunner(runner);
    }

    public void testSimultaneousRequestsAreQueued() throws Exception {
        Executor executor1 = new Executor(action1);
        executor1.start();
        waitTillRunnerIsBlocked(runner);
        Executor executor2 = new Executor(action2);
        executor2.start();
        runner.blocked = false;
        waitTillExecutorIsDead(executor1);
        waitTillRunnerIsBlocked(runner);
        runner.blocked = false;
        waitTillExecutorIsDead(executor2);
    }

    private void waitTillExecutorIsDead(Executor executor) throws InterruptedException {
        while (executor.isAlive())
            Thread.sleep(10);
    }

    private void waitTillRunnerIsBlocked(BlockingTestRunner runner) throws InterruptedException {
        while (!runner.blocked) {
            Thread.sleep(10);
        }
    }

    class Executor extends Thread {

        private TestRunnerAction action;

        public Executor(TestRunnerAction action) {
            this.action = action;

        }

        public void run() {
            try {
                action.execute();
            } catch (Exception e) {
                fail();
            }
        }
    }
}
