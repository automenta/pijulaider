package com.pijul.aider.versioning;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

public class FileBackend implements VersioningBackend {

    private final Path backupDir = Paths.get(".pijul-aider-backup");

    public FileBackend() {
        try {
            Files.createDirectories(backupDir);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public String getDiff() throws IOException {
        // Not implemented for file backend
        return "Diff not supported in FileBackend";
    }

    @Override
    public void add(String file) throws IOException {
        Path source = Paths.get(file);
        Path destination = backupDir.resolve(source.getFileName());
        Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
    }

    @Override
    public void record(String message) throws IOException {
        // Not implemented for file backend
    }

    @Override
    public String status() throws IOException {
        // Not implemented for file backend
        return "Status not supported in FileBackend";
    }
}
