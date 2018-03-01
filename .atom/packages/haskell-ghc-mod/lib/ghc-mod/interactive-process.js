"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const atom_1 = require("atom");
const util_1 = require("../util");
const os_1 = require("os");
const CP = require("child_process");
const Queue = require("promise-queue");
const pidusage = require("pidusage");
Symbol.asyncIterator =
    Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');
class InteractiveProcess {
    constructor(path, cmd, options, caps) {
        this.caps = caps;
        this.caps = caps;
        this.disposables = new atom_1.CompositeDisposable();
        this.emitter = new atom_1.Emitter();
        this.disposables.add(this.emitter);
        this.cwd = options.cwd;
        this.requestQueue = new Queue(1, 100);
        util_1.debug(`Spawning new ghc-modi instance for ${options.cwd} with options = `, options);
        this.proc = CP.spawn(path, cmd, options);
        this.proc.stdout.setEncoding('utf-8');
        this.proc.stderr.setEncoding('utf-8');
        this.proc.setMaxListeners(100);
        this.proc.stdout.setMaxListeners(100);
        this.proc.stderr.setMaxListeners(100);
        this.resetTimer();
        this.proc.once('exit', (code) => {
            this.timer && window.clearTimeout(this.timer);
            util_1.debug(`ghc-modi for ${options.cwd} ended with ${code}`);
            this.emitter.emit('did-exit', code);
            this.disposables.dispose();
        });
    }
    onceExit(action) {
        return this.emitter.once('did-exit', action);
    }
    async kill() {
        this.proc.stdin.end();
        this.proc.kill();
        return new Promise((resolve) => {
            this.proc.once('exit', (code) => resolve(code));
        });
    }
    async interact(command, args, data) {
        return this.requestQueue.add(async () => {
            this.proc.stdout.pause();
            this.proc.stderr.pause();
            pidusage.stat(this.proc.pid, (err, stat) => {
                if (err) {
                    util_1.warn(err);
                    return;
                }
                if (stat.memory >
                    atom.config.get('haskell-ghc-mod.maxMemMegs') * 1024 * 1024) {
                    this.proc.kill();
                }
            });
            util_1.debug(`Started interactive action block in ${this.cwd}`);
            util_1.debug(`Running interactive command ${command} ${args} ${data ? 'with' : 'without'} additional data`);
            let ended = false;
            try {
                const isEnded = () => ended;
                const stderr = [];
                const stdout = [];
                setImmediate(async () => {
                    try {
                        for (var _a = tslib_1.__asyncValues(this.readgen(this.proc.stderr, isEnded)), _b; _b = await _a.next(), !_b.done;) {
                            const line = await _b.value;
                            stderr.push(line);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) await _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    var e_1, _c;
                });
                const readOutput = async () => {
                    try {
                        for (var _a = tslib_1.__asyncValues(this.readgen(this.proc.stdout, isEnded)), _b; _b = await _a.next(), !_b.done;) {
                            const line = await _b.value;
                            util_1.debug(`Got response from ghc-modi: ${line}`);
                            if (line === 'OK') {
                                ended = true;
                            }
                            else {
                                stdout.push(line);
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) await _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    return { stdout, stderr };
                    var e_2, _c;
                };
                const exitEvent = async () => new Promise((_resolve, reject) => {
                    this.proc.once('exit', () => {
                        util_1.warn(stdout.join('\n'));
                        reject(util_1.mkError('GHCModInteractiveCrash', `${stdout}\n\n${stderr}`));
                    });
                });
                const timeoutEvent = async () => new Promise((_resolve, reject) => {
                    const tml = atom.config.get('haskell-ghc-mod.interactiveActionTimeout');
                    if (tml) {
                        setTimeout(() => {
                            reject(util_1.mkError('InteractiveActionTimeout', `${stdout}\n\n${stderr}`));
                        }, tml * 1000);
                    }
                });
                const args2 = this.caps.quoteArgs
                    ? ['ascii-escape', command].concat(args.map((x) => `\x02${x}\x03`))
                    : [command, ...args];
                util_1.debug(`Running ghc-modi command ${command}`, ...args);
                this.proc.stdin.write(`${args2.join(' ').replace(/(?:\r?\n|\r)/g, ' ')}${os_1.EOL}`);
                if (data) {
                    util_1.debug('Writing data to stdin...');
                    this.proc.stdin.write(`${data}${util_1.EOT}`);
                }
                return await Promise.race([readOutput(), exitEvent(), timeoutEvent()]);
            }
            catch (error) {
                if (error.name === 'InteractiveActionTimeout') {
                    this.proc.kill();
                }
                throw error;
            }
            finally {
                util_1.debug(`Ended interactive action block in ${this.cwd}`);
                ended = true;
                this.proc.stdout.resume();
                this.proc.stderr.resume();
            }
        });
    }
    resetTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        const tml = atom.config.get('haskell-ghc-mod.interactiveInactivityTimeout');
        if (tml) {
            this.timer = window.setTimeout(() => {
                this.kill();
            }, tml * 60 * 1000);
        }
    }
    async waitReadable(stream) {
        return new Promise((resolve) => stream.once('readable', () => {
            resolve();
        }));
    }
    readgen(out, isEnded) {
        return tslib_1.__asyncGenerator(this, arguments, function* readgen_1() {
            let buffer = '';
            while (!isEnded()) {
                const read = out.read();
                if (read !== null) {
                    buffer += read;
                    if (buffer.includes(os_1.EOL)) {
                        const arr = buffer.split(os_1.EOL);
                        buffer = arr.pop() || '';
                        yield tslib_1.__await(yield* tslib_1.__asyncDelegator(tslib_1.__asyncValues(arr)));
                    }
                }
                else {
                    yield tslib_1.__await(this.waitReadable(out));
                }
            }
            if (buffer) {
                out.unshift(buffer);
            }
        });
    }
}
exports.InteractiveProcess = InteractiveProcess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3RpdmUtcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9naGMtbW9kL2ludGVyYWN0aXZlLXByb2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQW1EO0FBQ25ELGtDQUFtRDtBQUNuRCwyQkFBd0I7QUFDeEIsb0NBQW1DO0FBQ25DLHVDQUF1QztBQUN2QyxxQ0FDQztBQUFDLE1BQWMsQ0FBQyxhQUFhO0lBQzVCLE1BQU0sQ0FBQyxhQUFhLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBYzVEO0lBYUUsWUFDRSxJQUFZLEVBQ1osR0FBYSxFQUNiLE9BQXdCLEVBQ2hCLElBQWdCO1FBQWhCLFNBQUksR0FBSixJQUFJLENBQVk7UUFFeEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7UUFDaEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDNUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGNBQU8sRUFBRSxDQUFBO1FBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNsQyxJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUE7UUFDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFFckMsWUFBSyxDQUNILHNDQUFzQyxPQUFPLENBQUMsR0FBRyxrQkFBa0IsRUFDbkUsT0FBTyxDQUNSLENBQUE7UUFDRCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDckMsSUFB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QUN4QixzQkFBQSxLQUFLLENBQUMsQ0FBQyx5QkFBQSxzQkFBQSxHQUFHLENBQUEsQ0FBQSxDQUFBLENBQUE7b0JBQ1osQ0FBQztnQkFDSCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLHNCQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQTtnQkFDOUIsQ0FBQztZQUNILENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDckIsQ0FBQztRQUNILENBQUM7S0FBQTtDQUNGO0FBck1ELGdEQXFNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgZGVidWcsIHdhcm4sIG1rRXJyb3IsIEVPVCB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQgeyBFT0wgfSBmcm9tICdvcydcbmltcG9ydCAqIGFzIENQIGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgUXVldWUgPSByZXF1aXJlKCdwcm9taXNlLXF1ZXVlJylcbmltcG9ydCBwaWR1c2FnZSA9IHJlcXVpcmUoJ3BpZHVzYWdlJylcbjsoU3ltYm9sIGFzIGFueSkuYXN5bmNJdGVyYXRvciA9XG4gIFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFN5bWJvbC5mb3IoJ1N5bWJvbC5hc3luY0l0ZXJhdG9yJylcblxuZXhwb3J0IGludGVyZmFjZSBHSENNb2RDYXBzIHtcbiAgdmVyc2lvbjogbnVtYmVyW11cbiAgZmlsZU1hcDogYm9vbGVhblxuICBxdW90ZUFyZ3M6IGJvb2xlYW5cbiAgb3B0cGFyc2U6IGJvb2xlYW5cbiAgdHlwZUNvbnN0cmFpbnRzOiBib29sZWFuXG4gIGJyb3dzZVBhcmVudHM6IGJvb2xlYW5cbiAgaW50ZXJhY3RpdmVDYXNlU3BsaXQ6IGJvb2xlYW5cbiAgaW1wb3J0ZWRGcm9tOiBib29sZWFuXG4gIGJyb3dzZU1haW46IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNsYXNzIEludGVyYWN0aXZlUHJvY2VzcyB7XG4gIHByaXZhdGUgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgcHJpdmF0ZSBlbWl0dGVyOiBFbWl0dGVyPFxuICAgIHt9LFxuICAgIHtcbiAgICAgICdkaWQtZXhpdCc6IG51bWJlclxuICAgIH1cbiAgPlxuICBwcml2YXRlIHByb2M6IENQLkNoaWxkUHJvY2Vzc1xuICBwcml2YXRlIGN3ZDogc3RyaW5nXG4gIHByaXZhdGUgdGltZXI6IG51bWJlciB8IHVuZGVmaW5lZFxuICBwcml2YXRlIHJlcXVlc3RRdWV1ZTogUXVldWVcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY21kOiBzdHJpbmdbXSxcbiAgICBvcHRpb25zOiB7IGN3ZDogc3RyaW5nIH0sXG4gICAgcHJpdmF0ZSBjYXBzOiBHSENNb2RDYXBzLFxuICApIHtcbiAgICB0aGlzLmNhcHMgPSBjYXBzXG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMuY3dkID0gb3B0aW9ucy5jd2RcbiAgICB0aGlzLnJlcXVlc3RRdWV1ZSA9IG5ldyBRdWV1ZSgxLCAxMDApXG5cbiAgICBkZWJ1ZyhcbiAgICAgIGBTcGF3bmluZyBuZXcgZ2hjLW1vZGkgaW5zdGFuY2UgZm9yICR7b3B0aW9ucy5jd2R9IHdpdGggb3B0aW9ucyA9IGAsXG4gICAgICBvcHRpb25zLFxuICAgIClcbiAgICB0aGlzLnByb2MgPSBDUC5zcGF3bihwYXRoLCBjbWQsIG9wdGlvbnMpXG4gICAgdGhpcy5wcm9jLnN0ZG91dC5zZXRFbmNvZGluZygndXRmLTgnKVxuICAgIHRoaXMucHJvYy5zdGRlcnIuc2V0RW5jb2RpbmcoJ3V0Zi04JylcbiAgICB0aGlzLnByb2Muc2V0TWF4TGlzdGVuZXJzKDEwMClcbiAgICB0aGlzLnByb2Muc3Rkb3V0LnNldE1heExpc3RlbmVycygxMDApXG4gICAgdGhpcy5wcm9jLnN0ZGVyci5zZXRNYXhMaXN0ZW5lcnMoMTAwKVxuICAgIHRoaXMucmVzZXRUaW1lcigpXG4gICAgdGhpcy5wcm9jLm9uY2UoJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgdGhpcy50aW1lciAmJiB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpXG4gICAgICBkZWJ1ZyhgZ2hjLW1vZGkgZm9yICR7b3B0aW9ucy5jd2R9IGVuZGVkIHdpdGggJHtjb2RlfWApXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWV4aXQnLCBjb2RlKVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIG9uY2VFeGl0KGFjdGlvbjogKGNvZGU6IG51bWJlcikgPT4gdm9pZCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub25jZSgnZGlkLWV4aXQnLCBhY3Rpb24pXG4gIH1cblxuICBwdWJsaWMgYXN5bmMga2lsbCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHRoaXMucHJvYy5zdGRpbi5lbmQoKVxuICAgIHRoaXMucHJvYy5raWxsKClcbiAgICByZXR1cm4gbmV3IFByb21pc2U8bnVtYmVyPigocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5wcm9jLm9uY2UoJ2V4aXQnLCAoY29kZSkgPT4gcmVzb2x2ZShjb2RlKSlcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGludGVyYWN0KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICBhcmdzOiBzdHJpbmdbXSxcbiAgICBkYXRhPzogc3RyaW5nLFxuICApOiBQcm9taXNlPHsgc3Rkb3V0OiBzdHJpbmdbXTsgc3RkZXJyOiBzdHJpbmdbXSB9PiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdFF1ZXVlLmFkZChhc3luYyAoKSA9PiB7XG4gICAgICB0aGlzLnByb2Muc3Rkb3V0LnBhdXNlKClcbiAgICAgIHRoaXMucHJvYy5zdGRlcnIucGF1c2UoKVxuXG4gICAgICBwaWR1c2FnZS5zdGF0KHRoaXMucHJvYy5waWQsIChlcnIsIHN0YXQpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHdhcm4oZXJyKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGlmIChcbiAgICAgICAgICBzdGF0Lm1lbW9yeSA+XG4gICAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdoYXNrZWxsLWdoYy1tb2QubWF4TWVtTWVncycpICogMTAyNCAqIDEwMjRcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5wcm9jLmtpbGwoKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBkZWJ1ZyhgU3RhcnRlZCBpbnRlcmFjdGl2ZSBhY3Rpb24gYmxvY2sgaW4gJHt0aGlzLmN3ZH1gKVxuICAgICAgZGVidWcoXG4gICAgICAgIGBSdW5uaW5nIGludGVyYWN0aXZlIGNvbW1hbmQgJHtjb21tYW5kfSAke2FyZ3N9ICR7XG4gICAgICAgICAgZGF0YSA/ICd3aXRoJyA6ICd3aXRob3V0J1xuICAgICAgICB9IGFkZGl0aW9uYWwgZGF0YWAsXG4gICAgICApXG4gICAgICBsZXQgZW5kZWQgPSBmYWxzZVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXNFbmRlZCA9ICgpID0+IGVuZGVkXG4gICAgICAgIGNvbnN0IHN0ZGVycjogc3RyaW5nW10gPSBbXVxuICAgICAgICBjb25zdCBzdGRvdXQ6IHN0cmluZ1tdID0gW11cbiAgICAgICAgc2V0SW1tZWRpYXRlKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGxpbmUgb2YgdGhpcy5yZWFkZ2VuKHRoaXMucHJvYy5zdGRlcnIsIGlzRW5kZWQpKSB7XG4gICAgICAgICAgICBzdGRlcnIucHVzaChsaW5lKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgcmVhZE91dHB1dCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGxpbmUgb2YgdGhpcy5yZWFkZ2VuKHRoaXMucHJvYy5zdGRvdXQsIGlzRW5kZWQpKSB7XG4gICAgICAgICAgICBkZWJ1ZyhgR290IHJlc3BvbnNlIGZyb20gZ2hjLW1vZGk6ICR7bGluZX1gKVxuICAgICAgICAgICAgaWYgKGxpbmUgPT09ICdPSycpIHtcbiAgICAgICAgICAgICAgZW5kZWQgPSB0cnVlXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdGRvdXQucHVzaChsaW5lKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBzdGRvdXQsIHN0ZGVyciB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhpdEV2ZW50ID0gYXN5bmMgKCkgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZTxuZXZlcj4oKF9yZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvYy5vbmNlKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgICB3YXJuKHN0ZG91dC5qb2luKCdcXG4nKSlcbiAgICAgICAgICAgICAgcmVqZWN0KFxuICAgICAgICAgICAgICAgIG1rRXJyb3IoJ0dIQ01vZEludGVyYWN0aXZlQ3Jhc2gnLCBgJHtzdGRvdXR9XFxuXFxuJHtzdGRlcnJ9YCksXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgY29uc3QgdGltZW91dEV2ZW50ID0gYXN5bmMgKCkgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZTxuZXZlcj4oKF9yZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRtbDogbnVtYmVyID0gYXRvbS5jb25maWcuZ2V0KFxuICAgICAgICAgICAgICAnaGFza2VsbC1naGMtbW9kLmludGVyYWN0aXZlQWN0aW9uVGltZW91dCcsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBpZiAodG1sKSB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdChcbiAgICAgICAgICAgICAgICAgIG1rRXJyb3IoJ0ludGVyYWN0aXZlQWN0aW9uVGltZW91dCcsIGAke3N0ZG91dH1cXG5cXG4ke3N0ZGVycn1gKSxcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH0sIHRtbCAqIDEwMDApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcblxuICAgICAgICBjb25zdCBhcmdzMiA9IHRoaXMuY2Fwcy5xdW90ZUFyZ3NcbiAgICAgICAgICA/IFsnYXNjaWktZXNjYXBlJywgY29tbWFuZF0uY29uY2F0KGFyZ3MubWFwKCh4KSA9PiBgXFx4MDIke3h9XFx4MDNgKSlcbiAgICAgICAgICA6IFtjb21tYW5kLCAuLi5hcmdzXVxuICAgICAgICBkZWJ1ZyhgUnVubmluZyBnaGMtbW9kaSBjb21tYW5kICR7Y29tbWFuZH1gLCAuLi5hcmdzKVxuICAgICAgICB0aGlzLnByb2Muc3RkaW4ud3JpdGUoXG4gICAgICAgICAgYCR7YXJnczIuam9pbignICcpLnJlcGxhY2UoLyg/Olxccj9cXG58XFxyKS9nLCAnICcpfSR7RU9MfWAsXG4gICAgICAgIClcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICBkZWJ1ZygnV3JpdGluZyBkYXRhIHRvIHN0ZGluLi4uJylcbiAgICAgICAgICB0aGlzLnByb2Muc3RkaW4ud3JpdGUoYCR7ZGF0YX0ke0VPVH1gKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLnJhY2UoW3JlYWRPdXRwdXQoKSwgZXhpdEV2ZW50KCksIHRpbWVvdXRFdmVudCgpXSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bnNhZmUtYW55XG4gICAgICAgIGlmIChlcnJvci5uYW1lID09PSAnSW50ZXJhY3RpdmVBY3Rpb25UaW1lb3V0Jykge1xuICAgICAgICAgIHRoaXMucHJvYy5raWxsKClcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZGVidWcoYEVuZGVkIGludGVyYWN0aXZlIGFjdGlvbiBibG9jayBpbiAke3RoaXMuY3dkfWApXG4gICAgICAgIGVuZGVkID0gdHJ1ZVxuICAgICAgICB0aGlzLnByb2Muc3Rkb3V0LnJlc3VtZSgpXG4gICAgICAgIHRoaXMucHJvYy5zdGRlcnIucmVzdW1lKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSByZXNldFRpbWVyKCkge1xuICAgIGlmICh0aGlzLnRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcilcbiAgICB9XG4gICAgY29uc3QgdG1sID0gYXRvbS5jb25maWcuZ2V0KCdoYXNrZWxsLWdoYy1tb2QuaW50ZXJhY3RpdmVJbmFjdGl2aXR5VGltZW91dCcpXG4gICAgaWYgKHRtbCkge1xuICAgICAgdGhpcy50aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1mbG9hdGluZy1wcm9taXNlc1xuICAgICAgICB0aGlzLmtpbGwoKVxuICAgICAgfSwgdG1sICogNjAgKiAxMDAwKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgd2FpdFJlYWRhYmxlKHN0cmVhbTogTm9kZUpTLlJlYWRhYmxlU3RyZWFtKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxuICAgICAgc3RyZWFtLm9uY2UoJ3JlYWRhYmxlJywgKCkgPT4ge1xuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pLFxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgKnJlYWRnZW4ob3V0OiBOb2RlSlMuUmVhZGFibGVTdHJlYW0sIGlzRW5kZWQ6ICgpID0+IGJvb2xlYW4pIHtcbiAgICBsZXQgYnVmZmVyID0gJydcbiAgICB3aGlsZSAoIWlzRW5kZWQoKSkge1xuICAgICAgY29uc3QgcmVhZCA9IG91dC5yZWFkKCkgYXMgc3RyaW5nIHwgbnVsbFxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1udWxsLWtleXdvcmRcbiAgICAgIGlmIChyZWFkICE9PSBudWxsKSB7XG4gICAgICAgIGJ1ZmZlciArPSByZWFkXG4gICAgICAgIGlmIChidWZmZXIuaW5jbHVkZXMoRU9MKSkge1xuICAgICAgICAgIGNvbnN0IGFyciA9IGJ1ZmZlci5zcGxpdChFT0wpXG4gICAgICAgICAgYnVmZmVyID0gYXJyLnBvcCgpIHx8ICcnXG4gICAgICAgICAgeWllbGQqIGFyclxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCB0aGlzLndhaXRSZWFkYWJsZShvdXQpXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChidWZmZXIpIHtcbiAgICAgIG91dC51bnNoaWZ0KGJ1ZmZlcilcbiAgICB9XG4gIH1cbn1cbiJdfQ==