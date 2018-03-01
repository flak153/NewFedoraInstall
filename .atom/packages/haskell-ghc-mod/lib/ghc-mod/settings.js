"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const Util = require("../util");
async function getSettings(runDir) {
    const localSettings = readSettings(runDir.getFile('.haskell-ghc-mod.json'));
    const [projectDir] = atom.project
        .getDirectories()
        .filter((d) => d.contains(runDir.getPath()));
    const projectSettings = projectDir
        ? readSettings(projectDir.getFile('.haskell-ghc-mod.json'))
        : Promise.resolve({});
    const configDir = new atom_1.Directory(atom.getConfigDirPath());
    const globalSettings = readSettings(configDir.getFile('haskell-ghc-mod.json'));
    const [glob, prj, loc] = await Promise.all([
        globalSettings,
        projectSettings,
        localSettings,
    ]);
    return Object.assign({}, glob, prj, loc);
}
exports.getSettings = getSettings;
async function readSettings(file) {
    try {
        const ex = await file.exists();
        if (ex) {
            const contents = await file.read();
            try {
                return JSON.parse(contents);
            }
            catch (err) {
                atom.notifications.addError(`Failed to parse ${file.getPath()}`, {
                    detail: err,
                    dismissable: true,
                });
                throw err;
            }
        }
        else {
            return {};
        }
    }
    catch (error) {
        if (error) {
            Util.warn(error);
        }
        return {};
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2hjLW1vZC9zZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFzQztBQUN0QyxnQ0FBK0I7QUFTeEIsS0FBSyxzQkFBc0IsTUFBaUI7SUFDakQsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFBO0lBRTNFLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTztTQUM5QixjQUFjLEVBQUU7U0FDaEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDOUMsTUFBTSxlQUFlLEdBQUcsVUFBVTtRQUNoQyxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUMzRCxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUV2QixNQUFNLFNBQVMsR0FBRyxJQUFJLGdCQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQTtJQUN4RCxNQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUE7SUFFOUUsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3pDLGNBQWM7UUFDZCxlQUFlO1FBQ2YsYUFBYTtLQUNkLENBQUMsQ0FBQTtJQUNGLE1BQU0sbUJBQU0sSUFBSSxFQUFLLEdBQUcsRUFBSyxHQUFHLEVBQUU7QUFDcEMsQ0FBQztBQW5CRCxrQ0FtQkM7QUFFRCxLQUFLLHVCQUF1QixJQUFVO0lBQ3BDLElBQUksQ0FBQztRQUNILE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDUCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtZQUNsQyxJQUFJLENBQUM7Z0JBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDN0IsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFO29CQUMvRCxNQUFNLEVBQUUsR0FBRztvQkFDWCxXQUFXLEVBQUUsSUFBSTtpQkFDbEIsQ0FBQyxDQUFBO2dCQUNGLE1BQU0sR0FBRyxDQUFBO1lBQ1gsQ0FBQztRQUNILENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxFQUFFLENBQUE7UUFDWCxDQUFDO0lBQ0gsQ0FBQztJQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDZixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNsQixDQUFDO1FBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQTtJQUNYLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmlsZSwgRGlyZWN0b3J5IH0gZnJvbSAnYXRvbSdcbmltcG9ydCAqIGFzIFV0aWwgZnJvbSAnLi4vdXRpbCdcblxuZXhwb3J0IGludGVyZmFjZSBHSENNb2RTZXR0aW5ncyB7XG4gIGRpc2FibGU/OiBib29sZWFuXG4gIHN1cHByZXNzRXJyb3JzPzogYm9vbGVhblxuICBnaGNPcHRpb25zPzogc3RyaW5nW11cbiAgZ2hjTW9kT3B0aW9ucz86IHN0cmluZ1tdXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTZXR0aW5ncyhydW5EaXI6IERpcmVjdG9yeSk6IFByb21pc2U8R0hDTW9kU2V0dGluZ3M+IHtcbiAgY29uc3QgbG9jYWxTZXR0aW5ncyA9IHJlYWRTZXR0aW5ncyhydW5EaXIuZ2V0RmlsZSgnLmhhc2tlbGwtZ2hjLW1vZC5qc29uJykpXG5cbiAgY29uc3QgW3Byb2plY3REaXJdID0gYXRvbS5wcm9qZWN0XG4gICAgLmdldERpcmVjdG9yaWVzKClcbiAgICAuZmlsdGVyKChkKSA9PiBkLmNvbnRhaW5zKHJ1bkRpci5nZXRQYXRoKCkpKVxuICBjb25zdCBwcm9qZWN0U2V0dGluZ3MgPSBwcm9qZWN0RGlyXG4gICAgPyByZWFkU2V0dGluZ3MocHJvamVjdERpci5nZXRGaWxlKCcuaGFza2VsbC1naGMtbW9kLmpzb24nKSlcbiAgICA6IFByb21pc2UucmVzb2x2ZSh7fSlcblxuICBjb25zdCBjb25maWdEaXIgPSBuZXcgRGlyZWN0b3J5KGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpKVxuICBjb25zdCBnbG9iYWxTZXR0aW5ncyA9IHJlYWRTZXR0aW5ncyhjb25maWdEaXIuZ2V0RmlsZSgnaGFza2VsbC1naGMtbW9kLmpzb24nKSlcblxuICBjb25zdCBbZ2xvYiwgcHJqLCBsb2NdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIGdsb2JhbFNldHRpbmdzLFxuICAgIHByb2plY3RTZXR0aW5ncyxcbiAgICBsb2NhbFNldHRpbmdzLFxuICBdKVxuICByZXR1cm4geyAuLi5nbG9iLCAuLi5wcmosIC4uLmxvYyB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYWRTZXR0aW5ncyhmaWxlOiBGaWxlKTogUHJvbWlzZTxHSENNb2RTZXR0aW5ncz4ge1xuICB0cnkge1xuICAgIGNvbnN0IGV4ID0gYXdhaXQgZmlsZS5leGlzdHMoKVxuICAgIGlmIChleCkge1xuICAgICAgY29uc3QgY29udGVudHMgPSBhd2FpdCBmaWxlLnJlYWQoKVxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuc2FmZS1hbnlcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudHMpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBGYWlsZWQgdG8gcGFyc2UgJHtmaWxlLmdldFBhdGgoKX1gLCB7XG4gICAgICAgICAgZGV0YWlsOiBlcnIsXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgIH0pXG4gICAgICAgIHRocm93IGVyclxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge31cbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBVdGlsLndhcm4oZXJyb3IpXG4gICAgfVxuICAgIHJldHVybiB7fVxuICB9XG59XG4iXX0=