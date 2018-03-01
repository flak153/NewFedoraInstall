"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Debugger_1 = require("./Debugger");
const BreakpointUI_1 = require("./BreakpointUI");
const TooltipOverride_1 = require("./TooltipOverride");
const atomAPI = require("atom");
const os = require("os");
const path = require("path");
const cp = require("child_process");
const config_1 = require("./config");
const SelectDebugModeView_1 = require("./views/SelectDebugModeView");
var config_2 = require("./config");
exports.config = config_2.config;
const breakpointUI = new BreakpointUI_1.BreakpointUI();
let debuggerInst;
let upi;
let state;
let disposables;
const commands = {
    'debug': async ({ currentTarget }) => {
        const ob = upi && await upi.getOthersConfigParam('ide-haskell-cabal', 'builder');
        if (ob) {
            debuggerInst = new Debugger_1.Debugger(breakpointUI.breakpoints, currentTarget.getModel(), ob.name);
        }
        else {
            debuggerInst = new Debugger_1.Debugger(breakpointUI.breakpoints, currentTarget.getModel());
        }
    },
    'debug-back': () => {
        if (debuggerInst) {
            debuggerInst.back();
        }
    },
    'debug-forward': () => {
        if (debuggerInst) {
            debuggerInst.forward();
        }
    },
    'debug-step': () => {
        if (debuggerInst) {
            debuggerInst.step();
        }
    },
    'debug-stop': () => {
        if (debuggerInst) {
            debuggerInst.stop();
        }
    },
    'debug-continue': () => {
        if (debuggerInst) {
            debuggerInst.continue();
        }
    },
    'toggle-breakpoint': ({ currentTarget }) => {
        breakpointUI.toggleBreakpoint(currentTarget.getModel().getCursorBufferPosition().row + 1, currentTarget.getModel());
    },
    'set-break-on-exception': async () => {
        const result = await SelectDebugModeView_1.selectDebugModeView(config_1.debugModes, atom.config.get('haskell-debug.breakOnException'));
        if (result !== undefined) {
            atom.config.set('haskell-debug.breakOnException', result);
        }
    },
};
function onFirstRun() {
    state = {
        properlyActivated: false,
    };
    const isWin = os.platform().indexOf('win') > -1;
    const where = isWin ? 'where' : 'whereis';
    const out = cp.exec(where + ' node');
    out.on('close', (code) => {
        if (code === 1) {
            atom.config.set('haskell-debug.nodeCommand', path.resolve(atom.packages.getApmPath(), '../../bin/atom'));
            if (state) {
                state.properlyActivated = true;
            }
        }
    });
}
function activePaneObserver(pane) {
    if (atom.workspace.isTextEditor(pane)) {
        const te = pane;
        const scopes = te.getRootScopeDescriptor().getScopesArray();
        if (scopes.length === 1 && scopes[0] === 'source.haskell') {
            if (!te.hasHaskellBreakpoints) {
                breakpointUI.attachToNewTextEditor(te);
                te.hasHaskellBreakpoints = true;
            }
            if (debuggerInst) {
                debuggerInst.showPanels();
            }
            return;
        }
    }
    if (debuggerInst) {
        debuggerInst.hidePanels();
    }
}
function activate(_state) {
    disposables = new atomAPI.CompositeDisposable();
    state = _state;
    if (state === undefined || state.properlyActivated !== true) {
        onFirstRun();
    }
    disposables.add(atom.workspace.observeActivePaneItem(activePaneObserver));
    for (const command of Object.keys(commands)) {
        disposables.add(atom.commands.add("atom-text-editor[data-grammar='source haskell']", 'haskell:' + command, commands[command]));
    }
}
exports.activate = activate;
function deactivate() {
    disposables && disposables.dispose();
}
exports.deactivate = deactivate;
function serialize() {
    return state;
}
exports.serialize = serialize;
function consumeHaskellUpi(reg) {
    const tooltipOverride = new TooltipOverride_1.TooltipOverride(async (expression) => {
        if (debuggerInst === undefined) {
            return undefined;
        }
        return debuggerInst.resolveExpression(expression);
    });
    upi = reg({
        name: 'haskell-debug',
        tooltip: {
            priority: 100,
            handler: tooltipOverride.tooltipHandler.bind(tooltipOverride),
        },
    });
    return upi;
}
exports.consumeHaskellUpi = consumeHaskellUpi;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFxQztBQUNyQyxpREFBNkM7QUFDN0MsdURBQW1EO0FBQ25ELGdDQUErQjtBQUMvQix5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLG9DQUFvQztBQUNwQyxxQ0FBcUM7QUFDckMscUVBQWlFO0FBRWpFLG1DQUFpQztBQUF4QiwwQkFBQSxNQUFNLENBQUE7QUFFZixNQUFNLFlBQVksR0FBRyxJQUFJLDJCQUFZLEVBQUUsQ0FBQTtBQUV2QyxJQUFJLFlBQWtDLENBQUE7QUFDdEMsSUFBSSxHQUFpQyxDQUFBO0FBQ3JDLElBQUksS0FBb0MsQ0FBQTtBQUN4QyxJQUFJLFdBQW9ELENBQUE7QUFJeEQsTUFBTSxRQUFRLEdBQUc7SUFDZixPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsYUFBYSxFQUFRLEVBQUUsRUFBRTtRQUN6QyxNQUFNLEVBQUUsR0FBRyxHQUFHLElBQUksTUFBTSxHQUFHLENBQUMsb0JBQW9CLENBQW1CLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQ2xHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDUCxZQUFZLEdBQUcsSUFBSSxtQkFBUSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMxRixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixZQUFZLEdBQUcsSUFBSSxtQkFBUSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDakYsQ0FBQztJQUNILENBQUM7SUFDRCxZQUFZLEVBQUUsR0FBRyxFQUFFO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDakIsWUFBWSxDQUFDLElB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Q3BCLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FDbEIsQ0FDRixDQUFBO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFsQkQsNEJBa0JDO0FBRUQ7SUFDRSxXQUFXLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3RDLENBQUM7QUFGRCxnQ0FFQztBQUVEO0lBQ0UsTUFBTSxDQUFDLEtBQUssQ0FBQTtBQUNkLENBQUM7QUFGRCw4QkFFQztBQUVELDJCQUFrQyxHQUF5QjtJQUN6RCxNQUFNLGVBQWUsR0FBRyxJQUFJLGlDQUFlLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxFQUFFO1FBQy9ELEVBQUUsQ0FBQyxDQUFDLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQTtRQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNuRCxDQUFDLENBQUMsQ0FBQTtJQUNGLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDUixJQUFJLEVBQUUsZUFBZTtRQUNyQixPQUFPLEVBQUU7WUFDUCxRQUFRLEVBQUUsR0FBRztZQUNiLE9BQU8sRUFBRSxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7U0FDOUQ7S0FDRixDQUFDLENBQUE7SUFDRixNQUFNLENBQUMsR0FBRyxDQUFBO0FBQ1osQ0FBQztBQWJELDhDQWFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVidWdnZXIgfSBmcm9tICcuL0RlYnVnZ2VyJ1xuaW1wb3J0IHsgQnJlYWtwb2ludFVJIH0gZnJvbSAnLi9CcmVha3BvaW50VUknXG5pbXBvcnQgeyBUb29sdGlwT3ZlcnJpZGUgfSBmcm9tICcuL1Rvb2x0aXBPdmVycmlkZSdcbmltcG9ydCAqIGFzIGF0b21BUEkgZnJvbSAnYXRvbSdcbmltcG9ydCBvcyA9IHJlcXVpcmUoJ29zJylcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5pbXBvcnQgY3AgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJylcbmltcG9ydCB7IGRlYnVnTW9kZXMgfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7IHNlbGVjdERlYnVnTW9kZVZpZXcgfSBmcm9tICcuL3ZpZXdzL1NlbGVjdERlYnVnTW9kZVZpZXcnXG5pbXBvcnQgKiBhcyBVUEkgZnJvbSAnYXRvbS1oYXNrZWxsLXVwaSdcbmV4cG9ydCB7IGNvbmZpZyB9IGZyb20gJy4vY29uZmlnJ1xuXG5jb25zdCBicmVha3BvaW50VUkgPSBuZXcgQnJlYWtwb2ludFVJKClcblxubGV0IGRlYnVnZ2VySW5zdDogRGVidWdnZXIgfCB1bmRlZmluZWRcbmxldCB1cGk6IFVQSS5JVVBJSW5zdGFuY2UgfCB1bmRlZmluZWRcbmxldCBzdGF0ZTogSGFza2VsbERlYnVnU3RhdGUgfCB1bmRlZmluZWRcbmxldCBkaXNwb3NhYmxlczogYXRvbUFQSS5Db21wb3NpdGVEaXNwb3NhYmxlIHwgdW5kZWZpbmVkXG5cbmV4cG9ydCB0eXBlIFRFQ0UgPSBhdG9tQVBJLkNvbW1hbmRFdmVudDxhdG9tQVBJLlRleHRFZGl0b3JFbGVtZW50PlxuXG5jb25zdCBjb21tYW5kcyA9IHtcbiAgJ2RlYnVnJzogYXN5bmMgKHsgY3VycmVudFRhcmdldCB9OiBURUNFKSA9PiB7XG4gICAgY29uc3Qgb2IgPSB1cGkgJiYgYXdhaXQgdXBpLmdldE90aGVyc0NvbmZpZ1BhcmFtPHsgbmFtZTogc3RyaW5nIH0+KCdpZGUtaGFza2VsbC1jYWJhbCcsICdidWlsZGVyJylcbiAgICBpZiAob2IpIHtcbiAgICAgIGRlYnVnZ2VySW5zdCA9IG5ldyBEZWJ1Z2dlcihicmVha3BvaW50VUkuYnJlYWtwb2ludHMsIGN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKSwgb2IubmFtZSlcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdnZXJJbnN0ID0gbmV3IERlYnVnZ2VyKGJyZWFrcG9pbnRVSS5icmVha3BvaW50cywgY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKVxuICAgIH1cbiAgfSxcbiAgJ2RlYnVnLWJhY2snOiAoKSA9PiB7XG4gICAgaWYgKGRlYnVnZ2VySW5zdCkge1xuICAgICAgZGVidWdnZXJJbnN0LmJhY2soKVxuICAgIH1cbiAgfSxcbiAgJ2RlYnVnLWZvcndhcmQnOiAoKSA9PiB7XG4gICAgaWYgKGRlYnVnZ2VySW5zdCkge1xuICAgICAgZGVidWdnZXJJbnN0LmZvcndhcmQoKVxuICAgIH1cbiAgfSxcbiAgJ2RlYnVnLXN0ZXAnOiAoKSA9PiB7XG4gICAgaWYgKGRlYnVnZ2VySW5zdCkge1xuICAgICAgZGVidWdnZXJJbnN0LnN0ZXAoKVxuICAgIH1cbiAgfSxcbiAgJ2RlYnVnLXN0b3AnOiAoKSA9PiB7XG4gICAgaWYgKGRlYnVnZ2VySW5zdCkge1xuICAgICAgZGVidWdnZXJJbnN0LnN0b3AoKVxuICAgIH1cbiAgfSxcbiAgJ2RlYnVnLWNvbnRpbnVlJzogKCkgPT4ge1xuICAgIGlmIChkZWJ1Z2dlckluc3QpIHtcbiAgICAgIGRlYnVnZ2VySW5zdC5jb250aW51ZSgpXG4gICAgfVxuICB9LFxuICAndG9nZ2xlLWJyZWFrcG9pbnQnOiAoeyBjdXJyZW50VGFyZ2V0IH06IFRFQ0UpID0+IHtcbiAgICBicmVha3BvaW50VUkudG9nZ2xlQnJlYWtwb2ludChcbiAgICAgIGN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKS5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdyArIDEsXG4gICAgICBjdXJyZW50VGFyZ2V0LmdldE1vZGVsKCksXG4gICAgKVxuICB9LFxuICAnc2V0LWJyZWFrLW9uLWV4Y2VwdGlvbic6IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZWxlY3REZWJ1Z01vZGVWaWV3KGRlYnVnTW9kZXMsIGF0b20uY29uZmlnLmdldCgnaGFza2VsbC1kZWJ1Zy5icmVha09uRXhjZXB0aW9uJykpXG4gICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7IGF0b20uY29uZmlnLnNldCgnaGFza2VsbC1kZWJ1Zy5icmVha09uRXhjZXB0aW9uJywgcmVzdWx0KSB9XG4gIH0sXG59XG5cbmZ1bmN0aW9uIG9uRmlyc3RSdW4oKSB7XG4gIHN0YXRlID0ge1xuICAgIHByb3Blcmx5QWN0aXZhdGVkOiBmYWxzZSxcbiAgfVxuXG4gIC8vIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNDk1MzE2OC9ub2RlLWNoZWNrLWV4aXN0ZW5jZS1vZi1jb21tYW5kLWluLXBhdGhcbiAgY29uc3QgaXNXaW4gPSBvcy5wbGF0Zm9ybSgpLmluZGV4T2YoJ3dpbicpID4gLTFcbiAgY29uc3Qgd2hlcmUgPSBpc1dpbiA/ICd3aGVyZScgOiAnd2hlcmVpcydcblxuICBjb25zdCBvdXQgPSBjcC5leGVjKHdoZXJlICsgJyBub2RlJylcblxuICBvdXQub24oJ2Nsb3NlJywgKGNvZGUpID0+IHtcbiAgICBpZiAoY29kZSA9PT0gMSkgey8vIG5vdCBmb3VuZFxuICAgICAgLy8gZmFsbGJhY2sgdG8gdGhlIG5vZGUgaW4gYXBtXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2hhc2tlbGwtZGVidWcubm9kZUNvbW1hbmQnLCBwYXRoLnJlc29sdmUoYXRvbS5wYWNrYWdlcy5nZXRBcG1QYXRoKCksICcuLi8uLi9iaW4vYXRvbScpKVxuICAgICAgaWYgKHN0YXRlKSB7IHN0YXRlLnByb3Blcmx5QWN0aXZhdGVkID0gdHJ1ZSB9XG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiBhY3RpdmVQYW5lT2JzZXJ2ZXIocGFuZTogb2JqZWN0KSB7XG4gIGlmIChhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IocGFuZSkpIHtcbiAgICBjb25zdCB0ZTogYXRvbUFQSS5UZXh0RWRpdG9yICYgeyBoYXNIYXNrZWxsQnJlYWtwb2ludHM/OiBib29sZWFuIH0gPSBwYW5lXG4gICAgY29uc3Qgc2NvcGVzID0gdGUuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KClcbiAgICBpZiAoc2NvcGVzLmxlbmd0aCA9PT0gMSAmJiBzY29wZXNbMF0gPT09ICdzb3VyY2UuaGFza2VsbCcpIHtcbiAgICAgIGlmICghdGUuaGFzSGFza2VsbEJyZWFrcG9pbnRzKSB7XG4gICAgICAgIGJyZWFrcG9pbnRVSS5hdHRhY2hUb05ld1RleHRFZGl0b3IodGUpXG4gICAgICAgIHRlLmhhc0hhc2tlbGxCcmVha3BvaW50cyA9IHRydWVcbiAgICAgIH1cbiAgICAgIGlmIChkZWJ1Z2dlckluc3QpIHtcbiAgICAgICAgZGVidWdnZXJJbnN0LnNob3dQYW5lbHMoKVxuICAgICAgfVxuICAgICAgcmV0dXJuICAvLyBkb24ndCBkbyBiZWxvd1xuICAgIH1cbiAgfVxuICAvLyBpZiBhbnkgcGFuZSB0aGF0IGlzbid0IGEgaGFza2VsbCBzb3VyY2UgZmlsZSBhbmQgd2UncmUgZGVidWdnaW5nXG4gIGlmIChkZWJ1Z2dlckluc3QpIHtcbiAgICBkZWJ1Z2dlckluc3QuaGlkZVBhbmVscygpXG4gIH1cbn1cblxuaW50ZXJmYWNlIEhhc2tlbGxEZWJ1Z1N0YXRlIHtcbiAgcHJvcGVybHlBY3RpdmF0ZWQ6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKF9zdGF0ZT86IEhhc2tlbGxEZWJ1Z1N0YXRlKSB7XG4gIGRpc3Bvc2FibGVzID0gbmV3IGF0b21BUEkuQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIHN0YXRlID0gX3N0YXRlXG5cbiAgaWYgKHN0YXRlID09PSB1bmRlZmluZWQgfHwgc3RhdGUucHJvcGVybHlBY3RpdmF0ZWQgIT09IHRydWUpIHtcbiAgICBvbkZpcnN0UnVuKClcbiAgfVxuICBkaXNwb3NhYmxlcy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKGFjdGl2ZVBhbmVPYnNlcnZlcikpXG5cbiAgZm9yIChjb25zdCBjb21tYW5kIG9mIE9iamVjdC5rZXlzKGNvbW1hbmRzKSkge1xuICAgIGRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICBcImF0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyPSdzb3VyY2UgaGFza2VsbCddXCIsXG4gICAgICAgICdoYXNrZWxsOicgKyBjb21tYW5kLFxuICAgICAgICBjb21tYW5kc1tjb21tYW5kXSxcbiAgICAgICksXG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBkaXNwb3NhYmxlcyAmJiBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZSgpIHtcbiAgcmV0dXJuIHN0YXRlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lSGFza2VsbFVwaShyZWc6IFVQSS5JVVBJUmVnaXN0cmF0aW9uKSB7XG4gIGNvbnN0IHRvb2x0aXBPdmVycmlkZSA9IG5ldyBUb29sdGlwT3ZlcnJpZGUoYXN5bmMgKGV4cHJlc3Npb24pID0+IHtcbiAgICBpZiAoZGVidWdnZXJJbnN0ID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZCB9XG4gICAgcmV0dXJuIGRlYnVnZ2VySW5zdC5yZXNvbHZlRXhwcmVzc2lvbihleHByZXNzaW9uKVxuICB9KVxuICB1cGkgPSByZWcoe1xuICAgIG5hbWU6ICdoYXNrZWxsLWRlYnVnJyxcbiAgICB0b29sdGlwOiB7XG4gICAgICBwcmlvcml0eTogMTAwLFxuICAgICAgaGFuZGxlcjogdG9vbHRpcE92ZXJyaWRlLnRvb2x0aXBIYW5kbGVyLmJpbmQodG9vbHRpcE92ZXJyaWRlKSxcbiAgICB9LFxuICB9KVxuICByZXR1cm4gdXBpXG59XG4iXX0=