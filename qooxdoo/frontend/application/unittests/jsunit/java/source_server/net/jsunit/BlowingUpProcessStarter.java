package net.jsunit;

import java.io.FileNotFoundException;
import java.io.IOException;

public class BlowingUpProcessStarter implements ProcessStarter {

    public Process execute(String[] command) throws IOException {
        throw new FileNotFoundException();
    }

}
