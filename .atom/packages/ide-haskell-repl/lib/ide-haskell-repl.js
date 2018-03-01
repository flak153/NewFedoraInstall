"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const atom_1 = require("atom");
const ide_haskell_repl_base_1 = require("./ide-haskell-repl-base");
const ide_haskell_repl_bg_1 = require("./ide-haskell-repl-bg");
const ide_haskell_repl_view_1 = require("./views/ide-haskell-repl-view");
tslib_1.__exportStar(require("./config"), exports);
let disposables;
const editorMap = new WeakMap();
const bgEditorMap = new Map();
let resolveUPIPromise;
const upiPromise = new Promise((resolve) => {
    resolveUPIPromise = resolve;
});
let resolveWatchEditorPromise;
const watchEditorPromise = new Promise((resolve) => {
    resolveWatchEditorPromise = resolve;
});
let upi;
function activate() {
    disposables = new atom_1.CompositeDisposable();
    disposables.add(atom.workspace.addOpener((uriToOpen) => {
        const m = uriToOpen.match(/^ide-haskell:\/\/repl\/(.*)$/);
        if (!(m && m[1])) {
            return undefined;
        }
        return createReplView({ uri: m[1], focus: true });
    }));
    disposables.add(atom.commands.add('atom-text-editor', {
        'ide-haskell-repl:toggle': async ({ currentTarget }) => open(currentTarget.getModel()),
    }));
    const commandFunction = (func) => ({ currentTarget, }) => {
        const view = editorMap.get(currentTarget.getModel());
        if (view) {
            ;
            view[func]();
        }
    };
    disposables.add(atom.commands.add('atom-text-editor.ide-haskell-repl', {
        'ide-haskell-repl:exec-command': commandFunction('execCommand'),
        'ide-haskell-repl:history-back': commandFunction('historyBack'),
        'ide-haskell-repl:history-forward': commandFunction('historyForward'),
        'ide-haskell-repl:ghci-reload': commandFunction('ghciReload'),
        'ide-haskell-repl:reload-repeat': commandFunction('ghciReloadRepeat'),
        'ide-haskell-repl:toggle-auto-reload-repeat': commandFunction('toggleAutoReloadRepeat'),
        'ide-haskell-repl:ghci-interrupt': commandFunction('interrupt'),
        'ide-haskell-repl:clear-output': commandFunction('clear'),
    }));
    const externalCommandFunction = (func) => ({ currentTarget, }) => {
        open(currentTarget.getModel(), false).then((model) => model[func]());
    };
    disposables.add(atom.commands.add('atom-text-editor:not(.ide-haskell-repl)', {
        'ide-haskell-repl:copy-selection-to-repl-input': ({ currentTarget }) => {
            const ed = currentTarget.getModel();
            const cmd = ed.getLastSelection().getText();
            open(ed).then((model) => model.copyText(cmd));
        },
        'ide-haskell-repl:run-selection-in-repl': ({ currentTarget }) => {
            const ed = currentTarget.getModel();
            const cmd = ed.getLastSelection().getText();
            open(ed, false).then(async (model) => model.runCommand(cmd));
        },
        'ide-haskell-repl:ghci-reload': externalCommandFunction('ghciReload'),
        'ide-haskell-repl:reload-repeat': externalCommandFunction('ghciReloadRepeat'),
        'ide-haskell-repl:toggle-auto-reload-repeat': externalCommandFunction('toggleAutoReloadRepeat'),
    }));
    disposables.add(atom.menu.add([
        {
            label: 'Haskell IDE',
            submenu: [
                {
                    label: 'Open REPL',
                    command: 'ide-haskell-repl:toggle',
                },
            ],
        },
    ]));
    setTimeout(() => {
        if (resolveUPIPromise && !upi) {
            resolveUPIPromise();
        }
    }, 5000);
}
exports.activate = activate;
function createReplView(state) {
    const view = new ide_haskell_repl_view_1.IdeHaskellReplView({ upiPromise, state, watchEditorPromise });
    editorMap.set(view.editor, view);
    return view;
}
exports.createReplView = createReplView;
async function open(editor, activate = true) {
    const grammar = editor && editor.getGrammar();
    const scope = grammar && grammar.scopeName;
    let uri;
    if (scope && scope.endsWith('haskell')) {
        uri = editor.getPath();
    }
    else {
        uri = '';
    }
    return atom.workspace.open(`ide-haskell://repl/${uri}`, {
        split: 'right',
        searchAllPanes: true,
        activatePane: activate,
    });
}
function deactivate() {
    disposables.dispose();
}
exports.deactivate = deactivate;
function consumeUPI(register) {
    upi = register({
        name: 'ide-haskell-repl',
        messageTypes: {
            repl: {
                uriFilter: false,
                autoScroll: true,
            },
        },
        tooltip: {
            priority: 200,
            handler: shouldShowTooltip,
        },
        events: {
            onDidSaveBuffer: didSaveBuffer,
        },
    });
    resolveUPIPromise(upi);
    disposables.add(upi);
    return upi;
}
exports.consumeUPI = consumeUPI;
async function shouldShowTooltip(editor, crange, _type) {
    if (!atom.config.get('ide-haskell-repl.showTypes')) {
        return undefined;
    }
    const path = editor.getPath();
    if (!path)
        return undefined;
    const { cwd, cabal, comp } = await ide_haskell_repl_base_1.IdeHaskellReplBase.componentFromURI(path);
    const hash = `${cwd.getPath()}::${cabal && cabal.name}::${comp && comp[0]}`;
    let bg = bgEditorMap.get(hash);
    if (!bg) {
        if (!editor.getPath()) {
            return undefined;
        }
        await upiPromise;
        bg = new ide_haskell_repl_bg_1.IdeHaskellReplBg(upiPromise, { uri: editor.getPath() });
        bgEditorMap.set(hash, bg);
    }
    return bg.showTypeAt(path, crange);
}
async function didSaveBuffer(buffer) {
    if (!atom.config.get('ide-haskell-repl.checkOnSave')) {
        return;
    }
    const path = buffer.getPath();
    if (!path)
        return;
    const { cwd, cabal, comp } = await ide_haskell_repl_base_1.IdeHaskellReplBase.componentFromURI(path);
    const hash = `${cwd.getPath()}::${cabal && cabal.name}::${comp && comp[0]}`;
    const bgt = bgEditorMap.get(hash);
    if (bgt) {
        bgt.ghciReload();
    }
    else {
        if (!buffer.getPath()) {
            return;
        }
        await upiPromise;
        const bg = new ide_haskell_repl_bg_1.IdeHaskellReplBg(upiPromise, { uri: buffer.getPath() });
        bgEditorMap.set(hash, bg);
    }
}
function autocompleteProvider_3_0_0() {
    return {
        scopeSelector: '.source.haskell',
        disableForScopeSelector: '.source.haskell .comment',
        inclusionPriority: 0,
        labels: ['ide-haskell-repl'],
        getSuggestions: async ({ editor, prefix, }) => {
            const view = editorMap.get(editor);
            if (!view) {
                return [];
            }
            return view.getCompletions(prefix);
        },
    };
}
exports.autocompleteProvider_3_0_0 = autocompleteProvider_3_0_0;
function consumeWatchEditor(watchEditor) {
    resolveWatchEditorPromise(watchEditor);
}
exports.consumeWatchEditor = consumeWatchEditor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlLWhhc2tlbGwtcmVwbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pZGUtaGFza2VsbC1yZXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtCQVFhO0FBQ2IsbUVBQTREO0FBQzVELCtEQUF3RDtBQUN4RCx5RUFBOEU7QUFHOUUsbURBQXdCO0FBRXhCLElBQUksV0FBZ0MsQ0FBQTtBQUNwQyxNQUFNLFNBQVMsR0FBNEMsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUN4RSxNQUFNLFdBQVcsR0FBa0MsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUM1RCxJQUFJLGlCQUFtRCxDQUFBO0FBQ3ZELE1BQU0sVUFBVSxHQUFHLElBQUksT0FBTyxDQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFO0lBQzNELGlCQUFpQixHQUFHLE9BQU8sQ0FBQTtBQUM3QixDQUFDLENBQUMsQ0FBQTtBQUNGLElBQUkseUJBQXFELENBQUE7QUFDekQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLE9BQU8sQ0FBZSxDQUFDLE9BQU8sRUFBRSxFQUFFO0lBQy9ELHlCQUF5QixHQUFHLE9BQU8sQ0FBQTtBQUNyQyxDQUFDLENBQUMsQ0FBQTtBQUNGLElBQUksR0FBaUMsQ0FBQTtBQUVyQztJQUNFLFdBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7SUFFdkMsV0FBVyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQWlCLEVBQUUsRUFBRTtRQUM3QyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUE7UUFDekQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLFNBQVMsQ0FBQTtRQUNsQixDQUFDO1FBQ0QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEdB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O0lBQ2xCLENBQUM7SUFDRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDN0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUMsU0FBUyxDQUFBO0lBQzNCLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sMENBQWtCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDNUUsTUFBTSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO0lBQzNFLElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDOUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1IsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxTQUFTLENBQUE7UUFDbEIsQ0FBQztRQUNELE1BQU0sVUFBVSxDQUFBO1FBQ2hCLEVBQUUsR0FBRyxJQUFJLHNDQUFnQixDQUFDLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ2hFLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQzNCLENBQUM7SUFDRCxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDcEMsQ0FBQztBQUVELEtBQUssd0JBQXdCLE1BQWtCO0lBQzdDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsTUFBTSxDQUFBO0lBQ1IsQ0FBQztJQUNELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM3QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUFDLE1BQU0sQ0FBQTtJQUNqQixNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLDBDQUFrQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzVFLE1BQU0sSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUMzRSxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2pDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFUixHQUFHLENBQUMsVUFBVSxFQUFFLENBQUE7SUFDbEIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQTtRQUNSLENBQUM7UUFDRCxNQUFNLFVBQVUsQ0FBQTtRQUNoQixNQUFNLEVBQUUsR0FBRyxJQUFJLHNDQUFnQixDQUFDLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3RFLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQzNCLENBQUM7QUFDSCxDQUFDO0FBRUQ7SUFDRSxNQUFNLENBQUM7UUFDTCxhQUFhLEVBQUUsaUJBQWlCO1FBQ2hDLHVCQUF1QixFQUFFLDBCQUEwQjtRQUVuRCxpQkFBaUIsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sRUFBRSxDQUFDLGtCQUFrQixDQUFDO1FBQzVCLGNBQWMsRUFBRSxLQUFLLEVBQUUsRUFDckIsTUFBTSxFQUNOLE1BQU0sR0FJUCxFQUFFLEVBQUU7WUFDSCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDVixNQUFNLENBQUMsRUFBRSxDQUFBO1lBQ1gsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3BDLENBQUM7S0FDRixDQUFBO0FBQ0gsQ0FBQztBQXJCRCxnRUFxQkM7QUFFRCw0QkFBbUMsV0FBeUI7SUFDMUQseUJBQXlCLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDeEMsQ0FBQztBQUZELGdEQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgVFdhdGNoRWRpdG9yLFxuICBDb21tYW5kRXZlbnQsXG4gIFRleHRFZGl0b3IsXG4gIFRleHRFZGl0b3JFbGVtZW50LFxuICBSYW5nZSxcbiAgVGV4dEJ1ZmZlcixcbn0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IElkZUhhc2tlbGxSZXBsQmFzZSB9IGZyb20gJy4vaWRlLWhhc2tlbGwtcmVwbC1iYXNlJ1xuaW1wb3J0IHsgSWRlSGFza2VsbFJlcGxCZyB9IGZyb20gJy4vaWRlLWhhc2tlbGwtcmVwbC1iZydcbmltcG9ydCB7IElkZUhhc2tlbGxSZXBsVmlldywgSVZpZXdTdGF0ZSB9IGZyb20gJy4vdmlld3MvaWRlLWhhc2tlbGwtcmVwbC12aWV3J1xuaW1wb3J0ICogYXMgVVBJIGZyb20gJ2F0b20taGFza2VsbC11cGknXG5cbmV4cG9ydCAqIGZyb20gJy4vY29uZmlnJ1xuXG5sZXQgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGVcbmNvbnN0IGVkaXRvck1hcDogV2Vha01hcDxUZXh0RWRpdG9yLCBJZGVIYXNrZWxsUmVwbFZpZXc+ID0gbmV3IFdlYWtNYXAoKVxuY29uc3QgYmdFZGl0b3JNYXA6IE1hcDxzdHJpbmcsIElkZUhhc2tlbGxSZXBsQmc+ID0gbmV3IE1hcCgpXG5sZXQgcmVzb2x2ZVVQSVByb21pc2U6ICh1cGk/OiBVUEkuSVVQSUluc3RhbmNlKSA9PiB2b2lkXG5jb25zdCB1cGlQcm9taXNlID0gbmV3IFByb21pc2U8VVBJLklVUElJbnN0YW5jZT4oKHJlc29sdmUpID0+IHtcbiAgcmVzb2x2ZVVQSVByb21pc2UgPSByZXNvbHZlXG59KVxubGV0IHJlc29sdmVXYXRjaEVkaXRvclByb21pc2U6ICh3ZTogVFdhdGNoRWRpdG9yKSA9PiB2b2lkXG5jb25zdCB3YXRjaEVkaXRvclByb21pc2UgPSBuZXcgUHJvbWlzZTxUV2F0Y2hFZGl0b3I+KChyZXNvbHZlKSA9PiB7XG4gIHJlc29sdmVXYXRjaEVkaXRvclByb21pc2UgPSByZXNvbHZlXG59KVxubGV0IHVwaTogVVBJLklVUElJbnN0YW5jZSB8IHVuZGVmaW5lZFxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gIGRpc3Bvc2FibGVzLmFkZChcbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIoKHVyaVRvT3Blbjogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtID0gdXJpVG9PcGVuLm1hdGNoKC9eaWRlLWhhc2tlbGw6XFwvXFwvcmVwbFxcLyguKikkLylcbiAgICAgIGlmICghKG0gJiYgbVsxXSkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgcmV0dXJuIGNyZWF0ZVJlcGxWaWV3KHsgdXJpOiBtWzFdLCBmb2N1czogdHJ1ZSB9KVxuICAgIH0pLFxuICApXG5cbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgJ2lkZS1oYXNrZWxsLXJlcGw6dG9nZ2xlJzogYXN5bmMgKHsgY3VycmVudFRhcmdldCB9KSA9PlxuICAgICAgICBvcGVuKGN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKSksXG4gICAgfSksXG4gIClcblxuICBjb25zdCBjb21tYW5kRnVuY3Rpb24gPSAoZnVuYzogc3RyaW5nKSA9PiAoe1xuICAgIGN1cnJlbnRUYXJnZXQsXG4gIH06IENvbW1hbmRFdmVudDxUZXh0RWRpdG9yRWxlbWVudD4pID0+IHtcbiAgICBjb25zdCB2aWV3ID0gZWRpdG9yTWFwLmdldChjdXJyZW50VGFyZ2V0LmdldE1vZGVsKCkpXG4gICAgaWYgKHZpZXcpIHtcbiAgICAgIDsodmlld1tmdW5jXSBhcyAoKSA9PiB2b2lkKSgpXG4gICAgfVxuICB9XG5cbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yLmlkZS1oYXNrZWxsLXJlcGwnLCB7XG4gICAgICAnaWRlLWhhc2tlbGwtcmVwbDpleGVjLWNvbW1hbmQnOiBjb21tYW5kRnVuY3Rpb24oJ2V4ZWNDb21tYW5kJyksXG4gICAgICAnaWRlLWhhc2tlbGwtcmVwbDpoaXN0b3J5LWJhY2snOiBjb21tYW5kRnVuY3Rpb24oJ2hpc3RvcnlCYWNrJyksXG4gICAgICAnaWRlLWhhc2tlbGwtcmVwbDpoaXN0b3J5LWZvcndhcmQnOiBjb21tYW5kRnVuY3Rpb24oJ2hpc3RvcnlGb3J3YXJkJyksXG4gICAgICAnaWRlLWhhc2tlbGwtcmVwbDpnaGNpLXJlbG9hZCc6IGNvbW1hbmRGdW5jdGlvbignZ2hjaVJlbG9hZCcpLFxuICAgICAgJ2lkZS1oYXNrZWxsLXJlcGw6cmVsb2FkLXJlcGVhdCc6IGNvbW1hbmRGdW5jdGlvbignZ2hjaVJlbG9hZFJlcGVhdCcpLFxuICAgICAgJ2lkZS1oYXNrZWxsLXJlcGw6dG9nZ2xlLWF1dG8tcmVsb2FkLXJlcGVhdCc6IGNvbW1hbmRGdW5jdGlvbihcbiAgICAgICAgJ3RvZ2dsZUF1dG9SZWxvYWRSZXBlYXQnLFxuICAgICAgKSxcbiAgICAgICdpZGUtaGFza2VsbC1yZXBsOmdoY2ktaW50ZXJydXB0JzogY29tbWFuZEZ1bmN0aW9uKCdpbnRlcnJ1cHQnKSxcbiAgICAgICdpZGUtaGFza2VsbC1yZXBsOmNsZWFyLW91dHB1dCc6IGNvbW1hbmRGdW5jdGlvbignY2xlYXInKSxcbiAgICB9KSxcbiAgKVxuXG4gIGNvbnN0IGV4dGVybmFsQ29tbWFuZEZ1bmN0aW9uID0gKGZ1bmM6IHN0cmluZykgPT4gKHtcbiAgICBjdXJyZW50VGFyZ2V0LFxuICB9OiBDb21tYW5kRXZlbnQ8VGV4dEVkaXRvckVsZW1lbnQ+KSA9PiB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWZsb2F0aW5nLXByb21pc2VzXG4gICAgb3BlbihjdXJyZW50VGFyZ2V0LmdldE1vZGVsKCksIGZhbHNlKS50aGVuKChtb2RlbCkgPT5cbiAgICAgIChtb2RlbFtmdW5jXSBhcyAoKSA9PiB2b2lkKSgpLFxuICAgIClcbiAgfVxuXG4gIGRpc3Bvc2FibGVzLmFkZChcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcjpub3QoLmlkZS1oYXNrZWxsLXJlcGwpJywge1xuICAgICAgJ2lkZS1oYXNrZWxsLXJlcGw6Y29weS1zZWxlY3Rpb24tdG8tcmVwbC1pbnB1dCc6ICh7IGN1cnJlbnRUYXJnZXQgfSkgPT4ge1xuICAgICAgICBjb25zdCBlZCA9IGN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxuICAgICAgICBjb25zdCBjbWQgPSBlZC5nZXRMYXN0U2VsZWN0aW9uKCkuZ2V0VGV4dCgpXG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1mbG9hdGluZy1wcm9taXNlc1xuICAgICAgICBvcGVuKGVkKS50aGVuKChtb2RlbCkgPT4gbW9kZWwuY29weVRleHQoY21kKSlcbiAgICAgIH0sXG4gICAgICAnaWRlLWhhc2tlbGwtcmVwbDpydW4tc2VsZWN0aW9uLWluLXJlcGwnOiAoeyBjdXJyZW50VGFyZ2V0IH0pID0+IHtcbiAgICAgICAgY29uc3QgZWQgPSBjdXJyZW50VGFyZ2V0LmdldE1vZGVsKClcbiAgICAgICAgY29uc3QgY21kID0gZWQuZ2V0TGFzdFNlbGVjdGlvbigpLmdldFRleHQoKVxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tZmxvYXRpbmctcHJvbWlzZXNcbiAgICAgICAgb3BlbihlZCwgZmFsc2UpLnRoZW4oYXN5bmMgKG1vZGVsKSA9PiBtb2RlbC5ydW5Db21tYW5kKGNtZCkpXG4gICAgICB9LFxuICAgICAgJ2lkZS1oYXNrZWxsLXJlcGw6Z2hjaS1yZWxvYWQnOiBleHRlcm5hbENvbW1hbmRGdW5jdGlvbignZ2hjaVJlbG9hZCcpLFxuICAgICAgJ2lkZS1oYXNrZWxsLXJlcGw6cmVsb2FkLXJlcGVhdCc6IGV4dGVybmFsQ29tbWFuZEZ1bmN0aW9uKFxuICAgICAgICAnZ2hjaVJlbG9hZFJlcGVhdCcsXG4gICAgICApLFxuICAgICAgJ2lkZS1oYXNrZWxsLXJlcGw6dG9nZ2xlLWF1dG8tcmVsb2FkLXJlcGVhdCc6IGV4dGVybmFsQ29tbWFuZEZ1bmN0aW9uKFxuICAgICAgICAndG9nZ2xlQXV0b1JlbG9hZFJlcGVhdCcsXG4gICAgICApLFxuICAgIH0pLFxuICApXG5cbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20ubWVudS5hZGQoW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0hhc2tlbGwgSURFJyxcbiAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBSRVBMJyxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdpZGUtaGFza2VsbC1yZXBsOnRvZ2dsZScsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSksXG4gIClcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBpZiAocmVzb2x2ZVVQSVByb21pc2UgJiYgIXVwaSkge1xuICAgICAgcmVzb2x2ZVVQSVByb21pc2UoKVxuICAgIH1cbiAgfSwgNTAwMClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlcGxWaWV3KHN0YXRlOiBJVmlld1N0YXRlKSB7XG4gIGNvbnN0IHZpZXcgPSBuZXcgSWRlSGFza2VsbFJlcGxWaWV3KHsgdXBpUHJvbWlzZSwgc3RhdGUsIHdhdGNoRWRpdG9yUHJvbWlzZSB9KVxuICBlZGl0b3JNYXAuc2V0KHZpZXcuZWRpdG9yLCB2aWV3KVxuICByZXR1cm4gdmlld1xufVxuXG5hc3luYyBmdW5jdGlvbiBvcGVuKFxuICBlZGl0b3I6IFRleHRFZGl0b3IsXG4gIGFjdGl2YXRlID0gdHJ1ZSxcbik6IFByb21pc2U8SWRlSGFza2VsbFJlcGxWaWV3PiB7XG4gIGNvbnN0IGdyYW1tYXIgPSBlZGl0b3IgJiYgZWRpdG9yLmdldEdyYW1tYXIoKVxuICBjb25zdCBzY29wZSA9IGdyYW1tYXIgJiYgZ3JhbW1hci5zY29wZU5hbWVcbiAgbGV0IHVyaVxuICBpZiAoc2NvcGUgJiYgc2NvcGUuZW5kc1dpdGgoJ2hhc2tlbGwnKSkge1xuICAgIHVyaSA9IGVkaXRvci5nZXRQYXRoKClcbiAgfSBlbHNlIHtcbiAgICB1cmkgPSAnJ1xuICB9XG4gIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGBpZGUtaGFza2VsbDovL3JlcGwvJHt1cml9YCwge1xuICAgIHNwbGl0OiAncmlnaHQnLFxuICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgIGFjdGl2YXRlUGFuZTogYWN0aXZhdGUsXG4gIH0pIGFzIFByb21pc2U8SWRlSGFza2VsbFJlcGxWaWV3PlxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lVVBJKHJlZ2lzdGVyOiBVUEkuSVVQSVJlZ2lzdHJhdGlvbikge1xuICB1cGkgPSByZWdpc3Rlcih7XG4gICAgbmFtZTogJ2lkZS1oYXNrZWxsLXJlcGwnLFxuICAgIG1lc3NhZ2VUeXBlczoge1xuICAgICAgcmVwbDoge1xuICAgICAgICB1cmlGaWx0ZXI6IGZhbHNlLFxuICAgICAgICBhdXRvU2Nyb2xsOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHRvb2x0aXA6IHtcbiAgICAgIHByaW9yaXR5OiAyMDAsXG4gICAgICBoYW5kbGVyOiBzaG91bGRTaG93VG9vbHRpcCxcbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgb25EaWRTYXZlQnVmZmVyOiBkaWRTYXZlQnVmZmVyLFxuICAgIH0sXG4gIH0pXG4gIHJlc29sdmVVUElQcm9taXNlKHVwaSlcbiAgZGlzcG9zYWJsZXMuYWRkKHVwaSlcbiAgcmV0dXJuIHVwaVxufVxuXG5hc3luYyBmdW5jdGlvbiBzaG91bGRTaG93VG9vbHRpcChcbiAgZWRpdG9yOiBUZXh0RWRpdG9yLFxuICBjcmFuZ2U6IFJhbmdlLFxuICBfdHlwZTogc3RyaW5nLFxuKSB7XG4gIGlmICghYXRvbS5jb25maWcuZ2V0KCdpZGUtaGFza2VsbC1yZXBsLnNob3dUeXBlcycpKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG4gIGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gIGlmICghcGF0aCkgcmV0dXJuIHVuZGVmaW5lZFxuICBjb25zdCB7IGN3ZCwgY2FiYWwsIGNvbXAgfSA9IGF3YWl0IElkZUhhc2tlbGxSZXBsQmFzZS5jb21wb25lbnRGcm9tVVJJKHBhdGgpXG4gIGNvbnN0IGhhc2ggPSBgJHtjd2QuZ2V0UGF0aCgpfTo6JHtjYWJhbCAmJiBjYWJhbC5uYW1lfTo6JHtjb21wICYmIGNvbXBbMF19YFxuICBsZXQgYmcgPSBiZ0VkaXRvck1hcC5nZXQoaGFzaClcbiAgaWYgKCFiZykge1xuICAgIGlmICghZWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBhd2FpdCB1cGlQcm9taXNlXG4gICAgYmcgPSBuZXcgSWRlSGFza2VsbFJlcGxCZyh1cGlQcm9taXNlLCB7IHVyaTogZWRpdG9yLmdldFBhdGgoKSB9KVxuICAgIGJnRWRpdG9yTWFwLnNldChoYXNoLCBiZylcbiAgfVxuICByZXR1cm4gYmcuc2hvd1R5cGVBdChwYXRoLCBjcmFuZ2UpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRpZFNhdmVCdWZmZXIoYnVmZmVyOiBUZXh0QnVmZmVyKSB7XG4gIGlmICghYXRvbS5jb25maWcuZ2V0KCdpZGUtaGFza2VsbC1yZXBsLmNoZWNrT25TYXZlJykpIHtcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCBwYXRoID0gYnVmZmVyLmdldFBhdGgoKVxuICBpZiAoIXBhdGgpIHJldHVyblxuICBjb25zdCB7IGN3ZCwgY2FiYWwsIGNvbXAgfSA9IGF3YWl0IElkZUhhc2tlbGxSZXBsQmFzZS5jb21wb25lbnRGcm9tVVJJKHBhdGgpXG4gIGNvbnN0IGhhc2ggPSBgJHtjd2QuZ2V0UGF0aCgpfTo6JHtjYWJhbCAmJiBjYWJhbC5uYW1lfTo6JHtjb21wICYmIGNvbXBbMF19YFxuICBjb25zdCBiZ3QgPSBiZ0VkaXRvck1hcC5nZXQoaGFzaClcbiAgaWYgKGJndCkge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1mbG9hdGluZy1wcm9taXNlc1xuICAgIGJndC5naGNpUmVsb2FkKClcbiAgfSBlbHNlIHtcbiAgICBpZiAoIWJ1ZmZlci5nZXRQYXRoKCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBhd2FpdCB1cGlQcm9taXNlXG4gICAgY29uc3QgYmcgPSBuZXcgSWRlSGFza2VsbFJlcGxCZyh1cGlQcm9taXNlLCB7IHVyaTogYnVmZmVyLmdldFBhdGgoKSB9KVxuICAgIGJnRWRpdG9yTWFwLnNldChoYXNoLCBiZylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXV0b2NvbXBsZXRlUHJvdmlkZXJfM18wXzAoKSB7XG4gIHJldHVybiB7XG4gICAgc2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuaGFza2VsbCcsXG4gICAgZGlzYWJsZUZvclNjb3BlU2VsZWN0b3I6ICcuc291cmNlLmhhc2tlbGwgLmNvbW1lbnQnLFxuICAgIC8vIGdldFRleHRFZGl0b3JTZWxlY3RvcjogKCkgPT4gJ2F0b20tdGV4dC1lZGl0b3IuaWRlLWhhc2tlbGwtcmVwbCcsXG4gICAgaW5jbHVzaW9uUHJpb3JpdHk6IDAsXG4gICAgbGFiZWxzOiBbJ2lkZS1oYXNrZWxsLXJlcGwnXSxcbiAgICBnZXRTdWdnZXN0aW9uczogYXN5bmMgKHtcbiAgICAgIGVkaXRvcixcbiAgICAgIHByZWZpeCxcbiAgICB9OiB7XG4gICAgICBlZGl0b3I6IFRleHRFZGl0b3JcbiAgICAgIHByZWZpeDogc3RyaW5nXG4gICAgfSkgPT4ge1xuICAgICAgY29uc3QgdmlldyA9IGVkaXRvck1hcC5nZXQoZWRpdG9yKVxuICAgICAgaWYgKCF2aWV3KSB7XG4gICAgICAgIHJldHVybiBbXVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZpZXcuZ2V0Q29tcGxldGlvbnMocHJlZml4KVxuICAgIH0sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVXYXRjaEVkaXRvcih3YXRjaEVkaXRvcjogVFdhdGNoRWRpdG9yKSB7XG4gIHJlc29sdmVXYXRjaEVkaXRvclByb21pc2Uod2F0Y2hFZGl0b3IpXG59XG4iXX0=