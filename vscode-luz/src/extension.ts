import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";

// ── Built-in functions with documentation ─────────────────────────────────────

const BUILTINS: { [key: string]: { detail: string; doc: string } } = {
    write:      { detail: "write(...values)",           doc: "Print one or more values to stdout." },
    listen:     { detail: "listen(prompt)",             doc: "Print prompt and read a line from stdin. Numbers are auto-converted." },
    typeof:     { detail: "typeof(value)",              doc: "Returns the type name as a string: 'int', 'float', 'string', 'bool', 'null', 'list', 'dict', or the class name." },
    instanceof: { detail: "instanceof(obj, Class)",     doc: "Returns true if obj is an instance of Class or any subclass." },
    to_int:     { detail: "to_int(v)",                  doc: "Convert value to integer. Raises CastFault on failure." },
    to_float:   { detail: "to_float(v)",                doc: "Convert value to float. Raises CastFault on failure." },
    to_str:     { detail: "to_str(v)",                  doc: "Convert value to string." },
    to_bool:    { detail: "to_bool(v)",                 doc: "Convert value to boolean." },
    to_num:     { detail: "to_num(v)",                  doc: "Convert string to int or float, auto-detecting which." },
    len:        { detail: "len(value)",                 doc: "Returns the length of a string, list, or dictionary." },
    append:     { detail: "append(list, value)",        doc: "Add value to the end of a list. Modifies the list in place." },
    pop:        { detail: "pop(list, index?)",          doc: "Remove and return the last element, or the element at index." },
    keys:       { detail: "keys(dict)",                 doc: "Returns a list of all keys in the dictionary." },
    values:     { detail: "values(dict)",               doc: "Returns a list of all values in the dictionary." },
    remove:     { detail: "remove(dict, key)",          doc: "Remove key from dictionary and return its value." },
    abs:        { detail: "abs(x)",                     doc: "Absolute value of x." },
    sqrt:       { detail: "sqrt(x)",                    doc: "Square root of x." },
    floor:      { detail: "floor(x)",                   doc: "Round x down to the nearest integer." },
    ceil:       { detail: "ceil(x)",                    doc: "Round x up to the nearest integer." },
    round:      { detail: "round(x, digits?)",          doc: "Round x to digits decimal places (default 0)." },
    clamp:      { detail: "clamp(x, low, high)",        doc: "Force x into the range [low, high]." },
    max:        { detail: "max(a, b, ...)",             doc: "Maximum of values or a list." },
    min:        { detail: "min(a, b, ...)",             doc: "Minimum of values or a list." },
    sign:       { detail: "sign(x)",                    doc: "Returns -1, 0, or 1 based on the sign of x." },
    odd:        { detail: "odd(x)",                     doc: "Returns true if x is odd." },
    even:       { detail: "even(x)",                    doc: "Returns true if x is even." },
    trim:       { detail: "trim(s)",                    doc: "Remove surrounding whitespace from string." },
    uppercase:  { detail: "uppercase(s)",               doc: "Convert string to uppercase." },
    lowercase:  { detail: "lowercase(s)",               doc: "Convert string to lowercase." },
    swap:       { detail: "swap(s, old, new)",          doc: "Replace all occurrences of old with new in string s." },
    split:      { detail: "split(s, sep?)",             doc: "Split string into a list. Default separator is whitespace." },
    join:       { detail: "join(sep, list)",            doc: "Join a list into a string using sep as separator." },
    contains:   { detail: "contains(s, sub)",           doc: "Returns true if sub is found in string s." },
    begins:     { detail: "begins(s, prefix)",          doc: "Returns true if string s starts with prefix." },
    ends:       { detail: "ends(s, suffix)",            doc: "Returns true if string s ends with suffix." },
    find:       { detail: "find(s, sub)",               doc: "Returns the index of the first occurrence of sub in s, or -1." },
    count:      { detail: "count(s, sub)",              doc: "Returns the number of occurrences of sub in s." },
};

const KEYWORDS = [
    "if", "elif", "else", "while", "for", "to", "in",
    "function", "return", "class", "extends", "self", "super",
    "import", "attempt", "rescue", "alert",
    "break", "continue", "pass",
    "true", "false", "null",
    "and", "or", "not", "fn",
];

// ── Diagnostics ────────────────────────────────────────────────────────────────

function getDiagnostics(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection
) {
    const config = vscode.workspace.getConfiguration("luz");
    const exe = config.get<string>("executablePath") || "luz";
    const filePath = document.uri.fsPath;

    // Try with the configured executable first, fall back to python main.py
    const tryExe = (cmd: string, args: string[]) => {
        cp.execFile(cmd, args, (err, stdout) => {
            if (err && (err as any).code === "ENOENT") {
                // Executable not found — try python fallback
                const ext = vscode.extensions.getExtension("Elabsurdo984.luz");
                const root = ext ? ext.extensionPath : "";
                const mainPy = path.join(root, "..", "main.py");
                cp.execFile("python", [mainPy, "--check", filePath], (err2, stdout2) => {
                    applyDiagnostics(document, collection, stdout2);
                });
                return;
            }
            applyDiagnostics(document, collection, stdout);
        });
    };

    tryExe(exe, ["--check", filePath]);
}

function applyDiagnostics(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection,
    stdout: string
) {
    try {
        const errors: { line: number | null; message: string }[] = JSON.parse(stdout.trim() || "[]");
        const diagnostics: vscode.Diagnostic[] = errors.map((e) => {
            const lineIndex = e.line != null ? e.line - 1 : 0;
            const line = document.lineAt(Math.max(0, Math.min(lineIndex, document.lineCount - 1)));
            const range = new vscode.Range(
                line.lineNumber, line.firstNonWhitespaceCharacterIndex,
                line.lineNumber, line.range.end.character
            );
            const diag = new vscode.Diagnostic(range, e.message, vscode.DiagnosticSeverity.Error);
            diag.source = "luz";
            return diag;
        });
        collection.set(document.uri, diagnostics);
    } catch {
        collection.set(document.uri, []);
    }
}

// ── Completion ─────────────────────────────────────────────────────────────────

function getUserSymbols(document: vscode.TextDocument): string[] {
    const text = document.getText();
    const symbols = new Set<string>();

    // Variables: name = ...
    for (const m of text.matchAll(/^([a-zA-Z_]\w*)\s*=/gm)) {
        symbols.add(m[1]);
    }
    // Functions: function name(
    for (const m of text.matchAll(/\bfunction\s+([a-zA-Z_]\w*)\s*\(/g)) {
        symbols.add(m[1]);
    }
    // Classes: class Name
    for (const m of text.matchAll(/\bclass\s+([A-Z][a-zA-Z_]\w*)/g)) {
        symbols.add(m[1]);
    }

    return Array.from(symbols);
}

class LuzCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        // Keywords
        for (const kw of KEYWORDS) {
            const item = new vscode.CompletionItem(kw, vscode.CompletionItemKind.Keyword);
            items.push(item);
        }

        // Built-ins
        for (const [name, info] of Object.entries(BUILTINS)) {
            const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
            item.detail = info.detail;
            item.documentation = new vscode.MarkdownString(info.doc);
            items.push(item);
        }

        // User-defined symbols
        for (const sym of getUserSymbols(document)) {
            if (!BUILTINS[sym] && !KEYWORDS.includes(sym)) {
                items.push(new vscode.CompletionItem(sym, vscode.CompletionItemKind.Variable));
            }
        }

        return items;
    }
}

// ── Hover ──────────────────────────────────────────────────────────────────────

class LuzHoverProvider implements vscode.HoverProvider {
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Hover | undefined {
        const range = document.getWordRangeAtPosition(position);
        if (!range) return;
        const word = document.getText(range);
        const info = BUILTINS[word];
        if (!info) return;
        const md = new vscode.MarkdownString();
        md.appendCodeblock(info.detail, "luz");
        md.appendMarkdown(info.doc);
        return new vscode.Hover(md);
    }
}

// ── Extension entry point ──────────────────────────────────────────────────────

export function activate(context: vscode.ExtensionContext) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("luz");
    context.subscriptions.push(diagnosticCollection);

    // Run diagnostics on open and save
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((doc) => {
            if (doc.languageId === "luz") getDiagnostics(doc, diagnosticCollection);
        }),
        vscode.workspace.onDidSaveTextDocument((doc) => {
            if (doc.languageId === "luz") getDiagnostics(doc, diagnosticCollection);
        }),
        vscode.workspace.onDidCloseTextDocument((doc) => {
            diagnosticCollection.delete(doc.uri);
        })
    );

    // Run on already-open documents
    vscode.workspace.textDocuments.forEach((doc) => {
        if (doc.languageId === "luz") getDiagnostics(doc, diagnosticCollection);
    });

    // Completion
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { language: "luz" },
            new LuzCompletionProvider()
        )
    );

    // Hover
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            { language: "luz" },
            new LuzHoverProvider()
        )
    );
}

export function deactivate() {}
