export class LocationSimulator {
  constructor(polyline, onUpdate) {
    this.polyline = polyline;
    this.onUpdate = onUpdate;
    this.index = 0;
    this.timer = null;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (this.index >= this.polyline.length) {
        this.index = 0; // Loop the route
      }
      this.onUpdate(this.polyline[this.index]);
      this.index++;
    }, 3000); // Update location every 3 seconds
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
