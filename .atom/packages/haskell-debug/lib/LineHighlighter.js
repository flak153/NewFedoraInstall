"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LineHighlighter {
    async hightlightLine(info) {
        const editor = (await atom.workspace.open(info.filename, { searchAllPanes: true }));
        editor.scrollToBufferPosition(info.range[0]);
        if (this.currentMarkedEditor !== editor && this.debugLineMarker !== undefined) {
            this.debugLineMarker.destroy();
            this.debugLineMarker = undefined;
        }
        this.currentMarkedEditor = editor;
        if (this.debugLineMarker === undefined) {
            this.debugLineMarker = editor.markBufferRange(info.range, { invalidate: 'never' });
            editor.decorateMarker(this.debugLineMarker, {
                type: 'highlight',
                class: 'highlight-green',
            });
            editor.decorateMarker(this.debugLineMarker, {
                type: 'line-number',
                class: 'highlight-green',
            });
            editor.decorateMarker(this.debugLineMarker, {
                type: 'gutter',
                class: 'highlight-green',
            });
        }
        else {
            this.debugLineMarker.setBufferRange(info.range);
        }
    }
    destroy() {
        if (this.debugLineMarker !== undefined) {
            this.debugLineMarker.destroy();
            this.debugLineMarker = undefined;
        }
    }
}
exports.LineHighlighter = LineHighlighter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGluZUhpZ2hsaWdodGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xpYi9MaW5lSGlnaGxpZ2h0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQTtJQUlTLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBZTtRQUN6QyxNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUE4QixDQUFBO1FBQ2hILE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFNUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUM5QixJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQTtRQUNsQyxDQUFDO1FBRUQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQTtRQUVqQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtZQUNsRixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQzFDLElBQUksRUFBRSxXQUFXO2dCQUNqQixLQUFLLEVBQUUsaUJBQWlCO2FBQ3pCLENBQUMsQ0FBQTtZQUNGLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDMUMsSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLEtBQUssRUFBRSxpQkFBaUI7YUFDekIsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUMxQyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxLQUFLLEVBQUUsaUJBQWlCO2FBQ3pCLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNqRCxDQUFDO0lBQ0gsQ0FBQztJQUVNLE9BQU87UUFDWixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUM5QixJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQTtRQUNsQyxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBeENELDBDQXdDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJyZWFrSW5mbyB9IGZyb20gJy4vR0hDSURlYnVnJ1xuaW1wb3J0IGF0b21BUEkgPSByZXF1aXJlKCdhdG9tJylcblxuZXhwb3J0IGNsYXNzIExpbmVIaWdobGlnaHRlciB7XG4gIHByaXZhdGUgZGVidWdMaW5lTWFya2VyPzogYXRvbUFQSS5EaXNwbGF5TWFya2VyXG4gIHByaXZhdGUgY3VycmVudE1hcmtlZEVkaXRvcj86IGF0b21BUEkuVGV4dEVkaXRvclxuXG4gIHB1YmxpYyBhc3luYyBoaWdodGxpZ2h0TGluZShpbmZvOiBCcmVha0luZm8pIHtcbiAgICBjb25zdCBlZGl0b3IgPSAoYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihpbmZvLmZpbGVuYW1lLCB7IHNlYXJjaEFsbFBhbmVzOiB0cnVlIH0pKSBhcyBhbnkgYXMgYXRvbUFQSS5UZXh0RWRpdG9yXG4gICAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oaW5mby5yYW5nZVswXSlcblxuICAgIGlmICh0aGlzLmN1cnJlbnRNYXJrZWRFZGl0b3IgIT09IGVkaXRvciAmJiB0aGlzLmRlYnVnTGluZU1hcmtlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmRlYnVnTGluZU1hcmtlci5kZXN0cm95KClcbiAgICAgIHRoaXMuZGVidWdMaW5lTWFya2VyID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50TWFya2VkRWRpdG9yID0gZWRpdG9yXG5cbiAgICBpZiAodGhpcy5kZWJ1Z0xpbmVNYXJrZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5kZWJ1Z0xpbmVNYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKGluZm8ucmFuZ2UsIHsgaW52YWxpZGF0ZTogJ25ldmVyJyB9KVxuICAgICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKHRoaXMuZGVidWdMaW5lTWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICBjbGFzczogJ2hpZ2hsaWdodC1ncmVlbicsXG4gICAgICB9KVxuICAgICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKHRoaXMuZGVidWdMaW5lTWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdsaW5lLW51bWJlcicsXG4gICAgICAgIGNsYXNzOiAnaGlnaGxpZ2h0LWdyZWVuJyxcbiAgICAgIH0pXG4gICAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIodGhpcy5kZWJ1Z0xpbmVNYXJrZXIsIHtcbiAgICAgICAgdHlwZTogJ2d1dHRlcicsXG4gICAgICAgIGNsYXNzOiAnaGlnaGxpZ2h0LWdyZWVuJyxcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVidWdMaW5lTWFya2VyLnNldEJ1ZmZlclJhbmdlKGluZm8ucmFuZ2UpXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZGVidWdMaW5lTWFya2VyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuZGVidWdMaW5lTWFya2VyLmRlc3Ryb3koKVxuICAgICAgdGhpcy5kZWJ1Z0xpbmVNYXJrZXIgPSB1bmRlZmluZWRcbiAgICB9XG4gIH1cbn1cbiJdfQ==