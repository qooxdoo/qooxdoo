package net.jsunit;

import java.io.IOException;

public class MockProcessStarter implements ProcessStarter {

    public String[] commandPassed;

    public Process execute(String[] command) throws IOException {
        this.commandPassed = command;
        return null;
    }

}
