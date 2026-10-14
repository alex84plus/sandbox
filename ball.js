
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ballButton = document.getElementById("ballButton");
const resetButton = document.getElementById("resetButton");

const ballRadiusInput = document.getElementById("length");
const ballWeightInput = document.getElementById("weight");

let balls = [];

const damping = 0.99;
const gravityHeavy = 0.9;
const gravityMid = 0.5;
const gravityLight = 0.2;
const friction = 0.2;

let holdingEndpoint = false;

let pointer = {
    x: 0,
    y:0
};

class Ball {
    constructor(x, y, radius, value){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.value = value;

        this.vx = 4;
        this.vy = 2;

        this.restitution = 0.8;
    }

    update(){
        // velocity using 2 points
        if(this.value = 1) this.vy += gravityHeavy;
        if(this.value = 2) this.vy += gravityMid;
        if(this.value = 3) this.vy += gravityLight;
        this.vx += friction;

        this.x += vx;
        this.y += vy;
        // bottom collision
        if(this.y + this.radius > canvas.height){
            this.y = canvas.height - this.radius;
            this.vy = -this.y * this.restitution;
        }
        // top collision
        if(this.y - this.radius < 0){
            this.y = this.radius;
            this.vy = -this.y * this.restitution;
        }
        // right collision
        if(this.x + this.radius > canvas.width){
            this.x = canvas.width - this.radius;
            this.vx = -this.x * this.restitution;
        }
        // left collision
        if(this.x - this.radius < 0){
            this.x = this.radius;
            this.vx = -this.x * this.restitution;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, this.value);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
    }
}

ballButton.addEventListener("click", () => {
    placingBall = true;

    console.log("Ball button clicked");
    console.log("placingBall:", placingBall);

    ballButton.classList.add("active");
});

resetButton.addEventListener("click", () => {
    balls = [];

    placingBall = false;
    holdingEndpoint = false;

    ballButton.classList.remove("active");
});

function createBall(startX, startY, radius, value){
    const newBall = new Ball(startX, startY, radius, value);
    balls.push(newBall);
    placingBall = false;
}

function animate() {
    newBall.update();
    newBall.draw();

    requestAnimationFrame(animate);
}

animate();
// all still from rope.js
canvas.addEventListener("pointerdown", event => {
    updatePointer(event);

    // Create a new ball
    if (placingBall) {
        const newRadius = Number(ballRadiusInput.value);
        const newWeight = Number(ballWeightInput.value);

        createBall(
            pointer.x,
            pointer.y,
            newRadius,
            newWeight
        );

        ballButton.classList.remove("active");
        return;
    }

    // If already holding a rope, clicking drops it

    // Otherwise, check every rope endpoint
    for (const ball of balls) {

        const dx = pointer.x - ball.x;
        const dy = pointer.y - ball.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
            holdingEndpoint = true;
            heldBall = ball;

            console.log("Picked up ball");

            break;
        }
    }
});

function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();

    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
}

canvas.addEventListener("pointermove", event => {
    if (!holdingEndpoint) return;
    updatePointer(event);

    const curr = heldBall;

    curr.x = pointer.x;
    curr.y = pointer.y;


});

canvas.addEventListener('pointerup', () => {
    holdingEndpoint = false;
})