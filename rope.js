
const canvas = document.getElementById("canvas");
const context = canvas.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ropeButton = document.getElementById("ropeButton");
const resetButton = document.getElementById("resetButton");
const ropeLengthInput = document.getElementById("length");


const damping = 0.99;
const gravity = 1800;
const segLength = 15;

let pointer = {
    x: 0,
    y:0
};

class Point{
    constructor(x,y, pinned){
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.pinned = false;
    }

    update(){
        // velocity using 2 points
        if (this.pined) return;

        vx = (this.x - this.oldX) * damping;
        vy = (this.y - this.oldY) * damping;

        this.oldX = this.x;
        this.oldY = this.y;

        this.x += vx;
        this.y += vy + gravity;
    }
}

let actualSegLength = segLength;

function createRope(startX, startY, totalLength){
    points = [];

    const segmentCount = Math.max(
        2,
        Math.ceil(totalLength / segLength)
    );

    actualSegLength = totalLength / segmentCount;

    for(let i = 0; i <= segmentCount; i++){
        const x = startX;
        const y = startY + i * actualSegLength;

        const pinned = i === 0;

        points.push(
            new Point(x, y, pinned)
        );
    }

    ropeActive = true;
    placingRope = false;
}

//

//

function update() {
    for (const point of points) {
        point.update();
    }

    solveConstraints();
}

function solveConstraints() {
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) continue;

        const difference =
            (distance - actualSegLength) / distance;

        const offsetX = dx * difference * 0.5;
        const offsetY = dy * difference * 0.5;

        if (!a.pinned) {
            a.x += offsetX;
            a.y += offsetY;
        }

        if (!b.pinned) {
            b.x -= offsetX;
            b.y -= offsetY;
        }
    }
}

canvas.addEventListener(
    "pointermove",
    event => {
        updatePointer(event);

        if (holdingEndpoint) {
            const end = points[points.length - 1];

            end.x = pointer.x;
            end.y = pointer.y;

            end.oldX = pointer.x;
            end.oldY = pointer.y;
        }
    }
);

function draw() {
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (points.length === 0) return;

    ctx.beginPath();

    ctx.moveTo(
        points[0].x,
        points[0].y
    );

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(
            points[i].x,
            points[i].y
        );
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.stroke();
}


function animate() {
    update();
    draw();

    requestAnimationFrame(animate);
}

animate();

ropeButton.addEventListener(
    "click",
    () => {
        placingRope = true;

        ropeButton.classList.add(
            "active"
        );

    }
);

resetButton.addEventListener(
    "click",
    () => {
        points = [];

        ropeActive = false;
        placingRope = false;
        holdingEndpoint = false;

        ropeButton.classList.remove(
            "active"
        );

    }
);