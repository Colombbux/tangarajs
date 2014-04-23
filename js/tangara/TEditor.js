define(['jquery','ace/ace', 'TCanvas', 'TEnvironment'], function($,ace,TCanvas,TEnvironment) {

    function TEditor() {
        var domEditor = document.createElement("div");
        domEditor.className = "teditor";

        var domEditorContainer = document.createElement("div");
        domEditorContainer.className = "teditor-inner";

        var domEditorCellText = document.createElement("div");
        domEditorCellText.className = "teditor-text";

        var domEditorCellButtons = document.createElement("div");
        domEditorCellButtons.className = "teditor-buttons";

        var domEditorText = document.createElement("div");
    domEditorText.setAttribute("contenteditable","true");
        domEditorText.id = "teditor-text-"+TEditor.editorId;
        domEditorText.className = "teditor-text-inner";

        // for iOS to show keyboard
        // TODO: add this only for iOS devices
        domEditorText.setAttribute("contenteditable", "true");

        domEditorCellText.appendChild(domEditorText);
        domEditorContainer.appendChild(domEditorCellText);

        var buttonExecute = document.createElement("button");
        buttonExecute.className = "teditor-button";
        var imageExecute = document.createElement("img");
        imageExecute.src = TEnvironment.getBaseUrl() + "/images/play.png";
        imageExecute.className = "teditor-button-image";
        buttonExecute.appendChild(imageExecute);
        buttonExecute.appendChild(document.createTextNode(TEnvironment.getMessage('button-execute')));

        var buttonClear = document.createElement("button");
        buttonClear.className = "teditor-button";
        var imageClear = document.createElement("img");
        imageClear.src = TEnvironment.getBaseUrl() + "/images/clear.png";
        imageClear.className = "teditor-button-image";
        buttonClear.appendChild(imageClear);
        buttonClear.appendChild(document.createTextNode(TEnvironment.getMessage('button-clear')));

        domEditorCellButtons.appendChild(buttonExecute);
        var separator = document.createElement("div");
        separator.className = "teditor-button-separator";
        domEditorCellButtons.appendChild(separator);
        domEditorCellButtons.appendChild(buttonClear);

        domEditorContainer.appendChild(domEditorCellButtons);

        domEditor.appendChild(domEditorContainer);

        TEditor.editorId++;

        var aceEditor;
        var langTools;

        this.getElement = function() {
            return domEditor;
        };

        this.displayed = function() {
            aceEditor = ace.edit(domEditorText.id);
            aceEditor.getSession().setMode("ace/mode/java");
            aceEditor.setShowPrintMargin(false);
            aceEditor.renderer.setShowGutter(false);
            aceEditor.setFontSize("20px");
            aceEditor.setHighlightActiveLine(false);
            aceEditor.setOptions({enableBasicAutocompletion: true});
            //langTools = ace.require("ace/ext/language_tools");
            aceEditor.focus();

            $(buttonExecute).click(function() {
                TEnvironment.execute(aceEditor.getSession().getValue());
                aceEditor.setValue("", -1);
            });

            $(buttonClear).click(function() {
                if (window.confirm(TEnvironment.getMessage('clear-confirm'))) {
                    TEnvironment.getCanvas().clear();
                    TEnvironment.clearLog();
                    TEnvironment.clearObjectListInstanced();
                    TEnvironment.clearMethodListInstanced();
                }
            });

            var totalCommands = 0;
            var history = 0;
            var archives_command=[];
            var commandlineNotEnded;
            var cursorPosition;

            aceEditor.commands.addCommand({
                name: 'executeCommand',
                bindKey: {win: 'Return',  mac: 'Return'},
                exec: function(editor) {
                    require(['TEnvironment'], function(TEnvironment) {
                        var commandline = aceEditor.getSession().getValue();
                        TEnvironment.execute(commandline);
                        editor.setValue("", -1);
                        if (commandline.length > 0){
                            archives_command.push($.trim(commandline));
                            totalCommands++;
                            history = totalCommands;
                            commandlineNotEnded ="";
                        }
                    });
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
            aceEditor.commands.addCommand({
                name: 'browseHistoryUp',
                bindKey: {win: 'Up',  mac: 'Up'},
                exec: function(editor) {
                    var commandLine;
                    if (history === totalCommands) {
                        commandlineNotEnded = editor.getValue();
                        cursorPosition = editor.getCursorPositionScreen();
                    }
                    if (history > 0) {
                        history--;
                        commandLine = archives_command[history];
                        editor.setValue(commandLine);
                        editor.navigateLineEnd();
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
            aceEditor.commands.addCommand({
                name: 'browsehistoryDown',
                bindKey: {win: 'Down',  mac: 'Down'},
                exec: function(editor) {
                    var commandLine;
                    if (history < totalCommands){
                        history++;
                        commandLine = archives_command[history];
                        editor.setValue(commandLine);
                        editor.navigateLineEnd();
                    }
                    if (history === totalCommands){
                        commandLine = commandlineNotEnded;
                        editor.setValue(commandLine);
                        editor.moveCursorToPosition(cursorPosition);
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
            aceEditor.commands.addCommand({
                name: 'returnToCurrentCommand',
                bindKey: {win: 'Escape',  mac: 'Escape'},
                exec: function(editor) {
                    var currentLine = editor.getValue();
                    var commandLine;
                    if (history === totalCommands) {
                        if (commandlineNotEnded !== currentLine) {
                            commandLine = currentLine;
                            cursorPosition = editor.getCursorPositionScreen();
                        }
                    } else {
                        history = totalCommands;
                        commandLine = commandlineNotEnded;
                    }
                    editor.setValue(commandLine);
                    editor.moveCursorToPosition(cursorPosition);
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
             aceEditor.commands.addCommand({
                name: 'completeCommand',
                bindKey: {win: '.',  mac: '.'},
                exec: function(editor) {
                    console.log("completion event");
                    // afficher la liste des ojects instanciés
                    var command = aceEditor.getSession().getValue();
                    var objectList = TEnvironment.getObjectListInstanced();
                    var methodList = TEnvironment.getMethodListInstanced();
                    console.log("command :" + command + "obj : " + objectList);
                    var index = objectList.indexOf(command);
                    if (index > -1) {
                        console.log("completion : ");
                        console.log("trouvé à l'index : " + index);
                        console.log("de la classe : " + methodList[index]);
                        
                        console.log("langue : " + this.language);
                        //console.log("langue : " + resourceList);
                        //translationFile = parentClass.;
                        window.console.log(TEnvironment.getCompletionList());
                        
                        var rhymeCompleter = {
                            getCompletions: function(editor, session, pos, prefix, callback) {
                                if (prefix.length === 0) { callback(null, []); return }
                                $.getJSON("http://rhymebrain.com/talk?function=getRhymes&word=" + prefix,
                                function(wordList) {
                                    // wordList like [{"word":"flow","freq":24,"score":300,"flags":"bc","syllables":"1"}]
                                    callback(null, wordList.map(function(ea) {
                                        return {name: ea.word, value: ea.word, score: ea.score, meta: "rhyme"}
                                    }));
                                })
                            }
                        }
                        langTools.addCompleter(rhymeCompleter);
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
             });
        };
    };

    TEditor.editorId = 0;

    return TEditor;
});
