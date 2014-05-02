define(['jquery', 'split-pane','TCanvas', 'TEditor', 'TUI', 'TConsole', 'TToolbar','TLog', 'TRuntime'], function($, SplitPane, TCanvas, TEditor, TUI, TConsole, TToolbar, TLog, TRuntime) {
    function TFrame() {
        var domFrame = document.createElement("div");
        domFrame.id = "tframe";
        domFrame.className = "split-pane horizontal-percent";
        var topDiv = document.createElement("div");
        topDiv.id = "tframe-top";
        topDiv.className = "split-pane-component";
        // Add Canvas
        var canvas = new TCanvas();
        topDiv.appendChild(canvas.getElement());
        // Add Editor
        var editor = new TEditor();
        topDiv.appendChild(editor.getElement());

        domFrame.appendChild(topDiv);

        var separator1 = document.createElement("div");
        separator1.id="tframe-separator";
        separator1.className="split-pane-divider";
        domFrame.appendChild(separator1);

        // Add Console, Toolbar and Log
        var bottomDiv = document.createElement("div");
        bottomDiv.id = "tframe-bottom";
        bottomDiv.className = "split-pane-component";
        // create special div to allow log to fill up remaining height
        var bottomTopDiv = document.createElement("div");
        bottomTopDiv.id = "tframe-bottom-top";
        var console = new TConsole();
        var consoleElement = console.getElement();
        bottomTopDiv.appendChild(consoleElement);
        var toolbar = new TToolbar();
        var toolbarElement = toolbar.getElement();
        bottomTopDiv.appendChild(toolbarElement);
        bottomDiv.appendChild(bottomTopDiv);
        var log = new TLog();
        var logElement = log.getElement();
        bottomDiv.appendChild(logElement);
        domFrame.appendChild(bottomDiv);

        // Set UI
        TUI.setCanvas(canvas);
        TUI.setEditor(editor);
        TUI.setToolbar(toolbar);
        TUI.setConsole(console);
        TUI.setLog(log);
        
        // Plug Runtime with Canvas and Log
        TRuntime.setCanvas(canvas);
        TRuntime.setLog(log);
        
        this.getElement = function() {
            return domFrame;
        };
        
        this.displayed = function() {
            canvas.displayed();
            editor.displayed();
            console.displayed();
            log.displayed();
            $('.split-pane').splitPane();
            // Start with console enabled
            TUI.enableConsole();
        };

    }
    
    return TFrame;
});
