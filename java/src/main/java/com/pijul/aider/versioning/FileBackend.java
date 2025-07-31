package com.pijul.aider.versioning;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public class FileBackend extends VersioningBackend {
    private final Map<String, String> files = new HashMap<>();

    @Override
    public CompletableFuture<Void> add(String file) {
        return CompletableFuture.runAsync(() -> {
            try {
                Path filePath = Paths.get(file);
                if (Files.exists(filePath)) {
                    if (!files.containsKey(file)) {
                        String backupFile = file + "." + System.currentTimeMillis() + ".bak";
                        Files.copy(filePath, Paths.get(backupFile), StandardCopyOption.REPLACE_EXISTING);
                        files.put(file, backupFile);
                    }
                } else {
                    throw new RuntimeException("File not found: " + file);
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Override
    public CompletableFuture<Void> unstage(String file) {
        return CompletableFuture.runAsync(() -> {
            String backupFile = files.get(file);
            if (backupFile != null) {
                try {
                    Files.deleteIfExists(Paths.get(backupFile));
                    files.remove(file);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        });
    }

    @Override
    public CompletableFuture<Void> record(String message) {
        // No-op for file backend
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public CompletableFuture<Void> unrecord(String hash) {
        // No-op for file backend
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public CompletableFuture<Void> channel(String subcommand, String name) {
        // No-op for file backend
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public CompletableFuture<Void> patch(String subcommand, String name) {
        // No-op for file backend
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public CompletableFuture<Void> apply(String patch) {
    public CompletableFuture<Void> apply(String patch) {
        return CompletableFuture.runAsync(() -> {
            try {
                // Create temporary file for patch
                Path tempPatch = Files.createTempFile("patch", ".diff");
                Files.write(tempPatch, patch.getBytes(StandardCharsets.UTF_8));
                
                // Apply patch using external tool (e.g., git)
                ProcessBuilder processBuilder = new ProcessBuilder("git", "apply", tempPatch.toString());
                processBuilder.redirectErrorStream(true);
                Process process = processBuilder.start();
                
                // Wait for process to complete
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    throw new RuntimeException("Failed to apply patch: " + new String(process.getErrorStream().readAllBytes()));
                }
                
                // Clean up temporary file
                Files.delete(tempPatch);
            } catch (IOException | InterruptedException e) {
                throw new RuntimeException("Error applying patch", e);
            }
        });
    }
    }

    @Override
    public CompletableFuture<String> conflicts() {
        return CompletableFuture.completedFuture("[]");
    }

    @Override
    public CompletableFuture<Void> revert(String file) {
        return CompletableFuture.runAsync(() -> {
            String backupFile = files.get(file);
            if (backupFile != null) {
                try {
                    Files.copy(Paths.get(backupFile), Paths.get(file), StandardCopyOption.REPLACE_EXISTING);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        });
    }

    @Override
    public CompletableFuture<Void> undo() {
        return CompletableFuture.runAsync(() -> {
            for (String file : files.keySet()) {
                try {
                    revert(file).get();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        });
    }

    @Override
    public CompletableFuture<String> diff() {
        // Simplified implementation - would need to implement diff logic
        return CompletableFuture.completedFuture("");
    }

    @Override
    public CompletableFuture<Void> clear() {
        return CompletableFuture.runAsync(() -> {
            for (String backupFile : files.values()) {
                try {
                    Files.deleteIfExists(Paths.get(backupFile));
                } catch (Exception e) {
                    // Ignore
                }
            }
            files.clear();
        });
    }

    @Override
    public CompletableFuture<List<String>> listTrackedFiles() {
        return CompletableFuture.completedFuture(new ArrayList<>(files.keySet()));
    }

    @Override
    public CompletableFuture<List<String>> listUntrackedFiles() {
        return CompletableFuture.completedFuture(new ArrayList<>());
    }
}