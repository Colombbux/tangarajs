define(['jquery', 'TRuntime', 'TEnvironment', 'quintus'], function($, TRuntime, TEnvironment, TError, Quintus) {
    var TUI = function() {
        var frame;
        var canvas;
        var editor;
        var toolbar;
        var console;
        var editorEnabled = false;
        var consoleEnabled = false;
        var consoleState = false;
        var designModeEnabled = false;
        var log;

        this.setFrame = function(element) {
            frame = element;
            return;
        };

        this.setCanvas = function(element) {
            canvas = element;
            return;
        };

        this.setEditor = function(element) {
            editor = element;
            return;
        };

        this.setLog = function(element) {
            log = element;
            return;
        };

        this.setToolbar = function(element) {
            toolbar = element;
            return;
        };

        this.setConsole = function(element) {
            console = element;
            return;
        };

        this.getCanvas = function() {
            return canvas;
        };

        this.enableConsole = function() {
            if (!consoleEnabled) {
                var editorWasEnabled = editorEnabled;
                // Editor and Console cannot co-exist
                this.disableEditor();
                toolbar.enableConsole();
                log.saveScroll();
                console.show();
                log.update();
                consoleEnabled = true;
                if (!editorWasEnabled || !consoleState) {
                    frame.raiseSeparator(console.getHeight());
                    log.restoreScroll();
                }
            }
        };

        this.disableConsole = function() {
            if (consoleEnabled) {
                toolbar.disableConsole();
                log.saveScroll();
                console.hide();
                log.update();
                consoleEnabled = false;
                frame.lowerSeparator(console.getHeight());
                log.restoreScroll();
            }
        };
        
        this.hideConsole = function() {
        };
        
        this.showConsole = function() {
        };

        this.toggleConsole = function() {
            if (consoleEnabled) {
                this.disableConsole();
            } else {
                this.enableConsole();
            }
        };

        this.enableEditor = function() {
            if (!editorEnabled) {
                // Editor and Console cannot co-exist
                consoleState = consoleEnabled;
                this.disableConsole();
                toolbar.enableEditor();
                TRuntime.stop();
                canvas.hide();
                editor.show();
                editorEnabled = true;
            }
        };

        this.disableEditor = function() {
            if (editorEnabled) {
                toolbar.disableEditor();
                editor.hide();
                canvas.show();
                editorEnabled = false;
                // if console was enabled, enable it
                if (consoleState)
                    this.enableConsole();
                TRuntime.start();
            }
        };

        this.toggleEditor = function() {
            if (editorEnabled) {
                this.disableEditor();
            } else {
                this.enableEditor();
            }
        };

        this.enableDesignMode = function() {
            if (!designModeEnabled) {
                TRuntime.freeze(true);
                canvas.setDesignMode(true);
                TRuntime.setDesignMode(true);
                designModeEnabled = true;
            }
        };

        this.disableDesignMode = function() {
            if (designModeEnabled) {
                TRuntime.freeze(false);
                canvas.setDesignMode(false);
                TRuntime.setDesignMode(false);
                designModeEnabled = false;
            }
        };

        this.toggleDesignMode = function() {
            if (designModeEnabled) {
                this.disableDesignMode();
            } else {
                this.enableDesignMode();
            }
        };
        
        this.clear = function(confirm) {
            var goOn = true;
            if (typeof confirm !== 'undefined' && confirm) {
                goOn = window.confirm(TEnvironment.getMessage('clear-confirm'));
            }
            if (goOn) {
                TRuntime.clear();
                console.clear();
                this.clearLog();
            }
        };

        this.addLogMessage = function(text) {
            if (typeof log !== 'undefined') {
                log.addMessage(text);
            }
        };

        this.clearLog = function() {
            if (typeof log !== 'undefined') {
                log.clear();
            }
        };
        
        this.getPreviousRow = function() {
            if (typeof log !== 'undefined') {
                return log.getPreviousRow();
            }
        };

        this.getNextRow = function() {
            if (typeof log !== 'undefined') {
                return log.getNextRow();
            }
        };
        
        this.setLastRow = function() {
            if (typeof log !== 'undefined') {
                return log.setLastRow();
            }
        };

        this.execute = function() {
            if (consoleEnabled) {
                // execution from console
                TRuntime.setCurrentProgramName(null);
                TRuntime.executeFrom(console);
                console.clear();
            } else if (editorEnabled) {
                // execution from editor
                this.clear(false);
                this.disableEditor();
                console.clear();
                TRuntime.setCurrentProgramName(editor.getCurrentProgramName());
                TRuntime.executeFrom(editor);
            }
        };
        
        this.handleError = function(index) {
            var error = log.getError(index);
            if (error.getProgramName() === null) {
                // error from command
                this.enableConsole();
                console.setValue(error.getCode());
                console.focus();
            } else {
                // error from program
                this.enableEditor();
                editor.editProgram(error.getProgramName());
                editor.setError(error.getLines());
            }
                
        };
    };
    
    var uiInstance = new TUI();
    
    return uiInstance;

});

