package net.jsunit.utility;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;

public class FileUtility {

    public static void delete(File file) {
        if (file.exists())
            file.delete();
    }

    public static void write(File file, String contents) {
        try {
            if (file.exists())
                file.delete();
            BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(file));
            out.write(contents.getBytes());
            out.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
