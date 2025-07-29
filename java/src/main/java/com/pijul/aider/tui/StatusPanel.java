package com.pijul.aider.tui;

import com.googlecode.lanterna.gui2.Label;
import com.googlecode.lanterna.gui2.Panel;

public class StatusPanel extends Panel {
    private final Label statusLabel;

    public StatusPanel() {
        this.statusLabel = new Label("");
        addComponent(statusLabel);
    }

    public void setStatus(String status) {
        statusLabel.setText(status);
    }
}
