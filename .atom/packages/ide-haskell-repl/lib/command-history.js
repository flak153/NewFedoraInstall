"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommandHistory {
    constructor(history = []) {
        this.back = history;
        this.current = -1;
        this.temp = '';
    }
    goBack(current) {
        if (this.current === -1) {
            this.temp = current;
        }
        this.current += 1;
        if (this.current >= this.back.length) {
            this.current = this.back.length - 1;
        }
        if (this.current < 0) {
            this.current = -1;
            return this.temp;
        }
        return this.back[this.current];
    }
    peek(shift) {
        return this.back[this.current - shift];
    }
    goForward() {
        if (this.current <= 0) {
            this.current = -1;
            return this.temp;
        }
        this.current -= 1;
        return this.back[this.current];
    }
    save(current) {
        this.current = -1;
        this.back.unshift(current);
    }
    serialize() {
        return this.back;
    }
}
exports.CommandHistory = CommandHistory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC1oaXN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbW1hbmQtaGlzdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0lBSUUsWUFBWSxVQUFvQixFQUFFO1FBQ2hDLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFBO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUE7SUFDaEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxPQUFlO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFBO1FBQ3JCLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQTtRQUNqQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtRQUNyQyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUE7UUFDbEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNoQyxDQUFDO0lBRU0sSUFBSSxDQUFDLEtBQWE7UUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0lBRU0sU0FBUztRQUNkLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFBO1lBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFBO1FBQ2xCLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQTtRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDaEMsQ0FBQztJQUVNLElBQUksQ0FBQyxPQUFlO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDNUIsQ0FBQztJQUVNLFNBQVM7UUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0NBQ0Y7QUE5Q0Qsd0NBOENDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIENvbW1hbmRIaXN0b3J5IHtcbiAgcHJpdmF0ZSBiYWNrOiBzdHJpbmdbXVxuICBwcml2YXRlIGN1cnJlbnQ6IG51bWJlclxuICBwcml2YXRlIHRlbXA6IHN0cmluZ1xuICBjb25zdHJ1Y3RvcihoaXN0b3J5OiBzdHJpbmdbXSA9IFtdKSB7XG4gICAgdGhpcy5iYWNrID0gaGlzdG9yeVxuICAgIHRoaXMuY3VycmVudCA9IC0xXG4gICAgdGhpcy50ZW1wID0gJydcbiAgfVxuXG4gIHB1YmxpYyBnb0JhY2soY3VycmVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5jdXJyZW50ID09PSAtMSkge1xuICAgICAgdGhpcy50ZW1wID0gY3VycmVudFxuICAgIH1cbiAgICB0aGlzLmN1cnJlbnQgKz0gMVxuICAgIGlmICh0aGlzLmN1cnJlbnQgPj0gdGhpcy5iYWNrLmxlbmd0aCkge1xuICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5iYWNrLmxlbmd0aCAtIDFcbiAgICB9XG4gICAgaWYgKHRoaXMuY3VycmVudCA8IDApIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IC0xXG4gICAgICByZXR1cm4gdGhpcy50ZW1wXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJhY2tbdGhpcy5jdXJyZW50XVxuICB9XG5cbiAgcHVibGljIHBlZWsoc2hpZnQ6IG51bWJlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuYmFja1t0aGlzLmN1cnJlbnQgLSBzaGlmdF1cbiAgfVxuXG4gIHB1YmxpYyBnb0ZvcndhcmQoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5jdXJyZW50IDw9IDApIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IC0xXG4gICAgICByZXR1cm4gdGhpcy50ZW1wXG4gICAgfVxuICAgIHRoaXMuY3VycmVudCAtPSAxXG4gICAgcmV0dXJuIHRoaXMuYmFja1t0aGlzLmN1cnJlbnRdXG4gIH1cblxuICBwdWJsaWMgc2F2ZShjdXJyZW50OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmN1cnJlbnQgPSAtMVxuICAgIHRoaXMuYmFjay51bnNoaWZ0KGN1cnJlbnQpXG4gIH1cblxuICBwdWJsaWMgc2VyaWFsaXplKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrXG4gIH1cbn1cbiJdfQ==