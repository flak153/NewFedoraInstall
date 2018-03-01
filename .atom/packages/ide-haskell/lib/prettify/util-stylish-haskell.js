"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_run_filter_1 = require("./util-run-filter");
async function format(text, workingDirectory, scope) {
    const command = atom.config.get('ide-haskell.stylishHaskellPath', { scope });
    const args = atom.config.get('ide-haskell.stylishHaskellArguments', { scope });
    return util_run_filter_1.runFilter({
        command,
        args,
        cwd: workingDirectory,
        stdin: text,
    });
}
exports.format = format;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC1zdHlsaXNoLWhhc2tlbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJldHRpZnkvdXRpbC1zdHlsaXNoLWhhc2tlbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBNkM7QUFHdEMsS0FBSyxpQkFDVixJQUFZLEVBQ1osZ0JBQXdCLEVBQ3hCLEtBQWdDO0lBRWhDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUM1RSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7SUFDOUUsTUFBTSxDQUFDLDJCQUFTLENBQUM7UUFDZixPQUFPO1FBQ1AsSUFBSTtRQUNKLEdBQUcsRUFBRSxnQkFBZ0I7UUFDckIsS0FBSyxFQUFFLElBQUk7S0FDWixDQUFDLENBQUE7QUFDSixDQUFDO0FBYkQsd0JBYUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBydW5GaWx0ZXIgfSBmcm9tICcuL3V0aWwtcnVuLWZpbHRlcidcbmltcG9ydCAqIGFzIEF0b21UeXBlcyBmcm9tICdhdG9tJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZm9ybWF0KFxuICB0ZXh0OiBzdHJpbmcsXG4gIHdvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZyxcbiAgc2NvcGU6IEF0b21UeXBlcy5TY29wZURlc2NyaXB0b3IsXG4pIHtcbiAgY29uc3QgY29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgnaWRlLWhhc2tlbGwuc3R5bGlzaEhhc2tlbGxQYXRoJywgeyBzY29wZSB9KVxuICBjb25zdCBhcmdzID0gYXRvbS5jb25maWcuZ2V0KCdpZGUtaGFza2VsbC5zdHlsaXNoSGFza2VsbEFyZ3VtZW50cycsIHsgc2NvcGUgfSlcbiAgcmV0dXJuIHJ1bkZpbHRlcih7XG4gICAgY29tbWFuZCxcbiAgICBhcmdzLFxuICAgIGN3ZDogd29ya2luZ0RpcmVjdG9yeSxcbiAgICBzdGRpbjogdGV4dCxcbiAgfSlcbn1cbiJdfQ==