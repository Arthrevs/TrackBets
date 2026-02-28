type Rect = { x: number, y: number, width: number, height: number };

class Shape {
    rect: Rect;
    constructor(rect: Rect) {
        this.rect = rect;
    }
}

class ShapeManager {
    shapes: Shape[] = [];

    // Check if two rectangles overlap
    private isOverlap(a: Rect, b: Rect): boolean {
        return !(a.x + a.width <= b.x ||
                 b.x + b.width <= a.x ||
                 a.y + a.height <= b.y ||
                 b.y + b.height <= a.y);
    }

    // Try to add a shape, only if it doesn't overlap
    addShape(newShape: Shape): boolean {
        for (const shape of this.shapes) {
            if (this.isOverlap(shape.rect, newShape.rect)) {
                return false; // Overlap detected
            }
        }
        this.shapes.push(newShape);
        return true; // Successfully added
    }
}
