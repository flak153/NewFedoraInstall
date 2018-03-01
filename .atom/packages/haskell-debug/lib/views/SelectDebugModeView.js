"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SelectListView = require("atom-select-list");
const React = require("./ReactPolyfill");
async function selectDebugModeView(debugModes, activeItem) {
    let panel;
    let res;
    try {
        res = await new Promise((resolve) => {
            const select = new SelectListView({
                items: debugModes,
                itemsClassList: ['mark-active'],
                elementForItem: (item) => React.createElement("li", { class: item.value === activeItem ? 'active' : '' }, item.description),
                filterKeyForItem: (item) => item.value,
                didCancelSelection: () => {
                    resolve();
                },
                didConfirmSelection: (item) => {
                    resolve(item.value);
                },
            });
            panel = atom.workspace.addModalPanel({
                item: select,
                visible: true,
            });
            select.focus();
        });
    }
    finally {
        panel && panel.destroy();
    }
    return res;
}
exports.selectDebugModeView = selectDebugModeView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0RGVidWdNb2RlVmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvdmlld3MvU2VsZWN0RGVidWdNb2RlVmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBbUQ7QUFDbkQseUNBQXlDO0FBVWxDLEtBQUssOEJBQThCLFVBQWtCLEVBQUUsVUFBa0I7SUFHOUUsSUFBSSxLQUFzRCxDQUFBO0lBQzFELElBQUksR0FBdUIsQ0FBQTtJQUMzQixJQUFJLENBQUM7UUFDSCxHQUFHLEdBQUcsTUFBTSxJQUFJLE9BQU8sQ0FBcUIsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN0RCxNQUFNLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBQztnQkFDaEMsS0FBSyxFQUFFLFVBQVU7Z0JBQ2pCLGNBQWMsRUFBRSxDQUFDLGFBQWEsQ0FBQztnQkFDL0IsY0FBYyxFQUFFLENBQUMsSUFBVSxFQUFFLEVBQUUsQ0FBQyw0QkFBSSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFHLElBQUksQ0FBQyxXQUFXLENBQU07Z0JBQzdHLGdCQUFnQixFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSztnQkFDdEMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO29CQUN2QixPQUFPLEVBQUUsQ0FBQTtnQkFDWCxDQUFDO2dCQUNELG1CQUFtQixFQUFFLENBQUMsSUFBVSxFQUFFLEVBQUU7b0JBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ3JCLENBQUM7YUFDRixDQUFDLENBQUE7WUFDRixLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7Z0JBQ25DLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2FBQ2QsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ2hCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztZQUFTLENBQUM7UUFDVCxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzFCLENBQUM7SUFDRCxNQUFNLENBQUMsR0FBRyxDQUFBO0FBQ1osQ0FBQztBQTdCRCxrREE2QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2VsZWN0TGlzdFZpZXcgPSByZXF1aXJlKCdhdG9tLXNlbGVjdC1saXN0JylcbmltcG9ydCBSZWFjdCA9IHJlcXVpcmUoJy4vUmVhY3RQb2x5ZmlsbCcpXG5pbXBvcnQgYXRvbUFQSSA9IHJlcXVpcmUoJ2F0b20nKVxuXG5pbnRlcmZhY2UgSXRlbSB7XG4gIHZhbHVlOiBWYWx1ZXNcbiAgZGVzY3JpcHRpb246IHN0cmluZ1xufVxuXG50eXBlIFZhbHVlcyA9ICdub25lJyB8ICdlcnJvcnMnIHwgJ2V4Y2VwdGlvbnMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWxlY3REZWJ1Z01vZGVWaWV3KGRlYnVnTW9kZXM6IEl0ZW1bXSwgYWN0aXZlSXRlbTogc3RyaW5nKTogUHJvbWlzZTxWYWx1ZXMgfCB1bmRlZmluZWQ+IHtcbiAgLy8gdGhpcy5zdG9yZUZvY3VzZWRFbGVtZW50KClcbiAgLy8gdGhpcy5zZXRJdGVtcyhkZWJ1Z01vZGVzKVxuICBsZXQgcGFuZWw6IGF0b21BUEkuUGFuZWw8U2VsZWN0TGlzdFZpZXc8SXRlbT4+IHwgdW5kZWZpbmVkXG4gIGxldCByZXM6IFZhbHVlcyB8IHVuZGVmaW5lZFxuICB0cnkge1xuICAgIHJlcyA9IGF3YWl0IG5ldyBQcm9taXNlPFZhbHVlcyB8IHVuZGVmaW5lZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IHNlbGVjdCA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICAgIGl0ZW1zOiBkZWJ1Z01vZGVzLFxuICAgICAgICBpdGVtc0NsYXNzTGlzdDogWydtYXJrLWFjdGl2ZSddLFxuICAgICAgICBlbGVtZW50Rm9ySXRlbTogKGl0ZW06IEl0ZW0pID0+IDxsaSBjbGFzcz17aXRlbS52YWx1ZSA9PT0gYWN0aXZlSXRlbSA/ICdhY3RpdmUnIDogJyd9PntpdGVtLmRlc2NyaXB0aW9ufTwvbGk+LFxuICAgICAgICBmaWx0ZXJLZXlGb3JJdGVtOiAoaXRlbSkgPT4gaXRlbS52YWx1ZSxcbiAgICAgICAgZGlkQ2FuY2VsU2VsZWN0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH0sXG4gICAgICAgIGRpZENvbmZpcm1TZWxlY3Rpb246IChpdGVtOiBJdGVtKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZShpdGVtLnZhbHVlKVxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7XG4gICAgICAgIGl0ZW06IHNlbGVjdCxcbiAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgIH0pXG4gICAgICBzZWxlY3QuZm9jdXMoKVxuICAgIH0pXG4gIH0gZmluYWxseSB7XG4gICAgcGFuZWwgJiYgcGFuZWwuZGVzdHJveSgpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuIl19