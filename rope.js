
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ropeButton = document.getElementById("ropeButton");
const resetButton = document.getElementById("resetButton");
const ropeLengthInput = document.getElementById("length");


const damping = 0.99;
const gravity = 0.5;
const segLength = 15;

let ropes = [];

let ropeActive = false;
let placingRope = false;
let holdingEndpoint = false;

let heldRope = null;

let pointer = {
    x: 0,
    y:0
};

class Point{
    constructor(x,y, pinned = false){
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.pinned = pinned;
    }

    update(){
        // velocity using 2 points
        if (this.pinned) return;

        const vx = (this.x - this.oldX) * damping;
        const vy = (this.y - this.oldY) * damping;

        this.oldX = this.x;
        this.oldY = this.y;

        this.x += vx;
        this.y += vy + gravity;
    }
}

function createRope(startX, startY, totalLength) {
    const points = [];

    const segmentCount = Math.max(
        2,
        Math.ceil(totalLength / segLength)
    );

    const actualSegLength =
        totalLength / segmentCount;

    for (let i = 0; i <= segmentCount; i++) {
        const x = startX;
        const y = startY + i * actualSegLength;

        const pinned = i === 0;

        points.push(
            new Point(x, y, pinned)
        );
    }

    ropes.push({
        points: points,
        segmentLength: actualSegLength
    });

    console.log("ropes:", ropes.length);
    console.log("all ropes:", ropes);

    placingRope = false;
}

//

//

function update() {
    for (const rope of ropes) {
        for (const point of rope.points) {
            point.update();
        }

        solveConstraints(rope);
    }
}

function solveConstraints(rope) {
    const points = rope.points;

    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) continue;

        const difference =
            (distance - rope.segmentLength) / distance;

        const offsetX =
            dx * difference * 0.5;

        const offsetY =
            dy * difference * 0.5;

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

function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();

    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
}

canvas.addEventListener("pointermove", event => {
    updatePointer(event);

    if (holdingEndpoint && heldRope) {
        const end =
            heldRope.points[heldRope.points.length - 1];

        end.x = pointer.x;
        end.y = pointer.y;

        end.oldX = pointer.x;
        end.oldY = pointer.y;
    }
});
function draw() {
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    for (let r = 0; r < ropes.length; r++) {
        const rope = ropes[r];
        const points = rope.points;

        if (points.length === 0) continue;

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

        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.stroke();

        const end =
            points[points.length - 1];

        ctx.beginPath();

        ctx.arc(
            end.x,
            end.y,
            8,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "red";
        ctx.fill();
    }
}


function animate() {
    update();
    draw();

    requestAnimationFrame(animate);
}

animate();

ropeButton.addEventListener("click", () => {
    placingRope = true;

    console.log("Rope button clicked");
    console.log("placingRope:", placingRope);

    ropeButton.classList.add("active");
});

resetButton.addEventListener("click", () => {
    ropes = [];

    placingRope = false;
    holdingEndpoint = false;

    ropeButton.classList.remove("active");
});
canvas.addEventListener("pointerdown", event => {
    updatePointer(event);

    // Create a new rope
    if (placingRope) {
        const totalLength = Number(ropeLengthInput.value);

        createRope(
            pointer.x,
            pointer.y,
            totalLength
        );

        ropeButton.classList.remove("active");
        return;
    }

    // If already holding a rope, clicking drops it
    if (holdingEndpoint) {
        holdingEndpoint = false;
        heldRope = null;
        return;
    }

    // Otherwise, check every rope endpoint
    for (const rope of ropes) {

        const end =
            rope.points[rope.points.length - 1];

        const dx = pointer.x - end.x;
        const dy = pointer.y - end.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
            holdingEndpoint = true;
            heldRope = rope;

            console.log("Picked up rope");

            break;
        }
    }
});
