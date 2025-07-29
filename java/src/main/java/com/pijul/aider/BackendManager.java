package com.pijul.aider;

import com.pijul.aider.versioning.FileBackend;
import com.pijul.aider.versioning.GitBackend;
import com.pijul.aider.versioning.PijulBackend;
import com.pijul.aider.versioning.VersioningBackend;

import java.io.File;

public class BackendManager {

    public static VersioningBackend getBackend() {
        if (new File(".git").exists()) {
            return new GitBackend();
        } else if (new File(".pijul").exists()) {
            return new PijulBackend();
        } else {
            return new FileBackend();
        }
    }
}
