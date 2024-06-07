
// window.addEventListener('DOMContentLoaded', (event) => {
const squaretable = {} // this section of code is an optimization for use of the hypotenuse function on Line and LineOP objects
for (let t = 0; t < 10000000; t++) {
    squaretable[`${t}`] = Math.sqrt(t)
    if (t > 999) {
        t += 9
    }
}
let video_recorder
let recording = 0
function CanvasCaptureToWEBM(canvas, bitrate) {
    // the video_recorder is set to  '= new CanvasCaptureToWEBM(canvas, 4500000);' in the setup, 
    // it uses the same canvas as the rest of the file.
    // to start a recording call .record() on video_recorder
    /*
    for example, 
    if(keysPressed['-'] && recording == 0){
        recording = 1
        video_recorder.record()
    }
    if(keysPressed['='] && recording == 1){
        recording = 0
        video_recorder.stop()
        video_recorder.download('File Name As A String.webm')
    }
    */
    this.record = Record
    this.stop = Stop
    this.download = saveToDownloads
    let blobCaptures = []
    let outputFormat = {}
    let recorder = {}
    let canvasInput = canvas.captureStream()
    if (typeof canvasInput == undefined || !canvasInput) {
        return
    }
    const video = document.createElement('video')
    video.style.display = 'none'

    function Record() {
        let formats = [
            'video/vp8',
            "video/webm",
            'video/webm,codecs=vp9',
            "video/webm\;codecs=vp8",
            "video/webm\;codecs=daala",
            "video/webm\;codecs=h264",
            "video/mpeg"
        ];

        for (let t = 0; t < formats.length; t++) {
            if (MediaRecorder.isTypeSupported(formats[t])) {
                outputFormat = formats[t]
                break
            }
        }
        if (typeof outputFormat != "string") {
            return
        } else {
            let videoSettings = {
                mimeType: outputFormat,
                videoBitsPerSecond: bitrate || 2000000 // 2Mbps
            };
            blobCaptures = []
            try {
                recorder = new MediaRecorder(canvasInput, videoSettings)
            } catch (error) {
                return;
            }
            recorder.onstop = handleStop
            recorder.ondataavailable = handleAvailableData
            recorder.start(100)
        }
    }
    function handleAvailableData(event) {
        if (event.data && event.data.size > 0) {
            blobCaptures.push(event.data)
        }
    }
    function handleStop() {
        const superBuffer = new Blob(blobCaptures, { type: outputFormat })
        video.src = window.URL.createObjectURL(superBuffer)
    }
    function Stop() {
        recorder.stop()
        video.controls = true
    }
    function saveToDownloads(input) { // specifying a file name for the output
        const name = input || 'video_out.webm'
        const blob = new Blob(blobCaptures, { type: outputFormat })
        const url = window.URL.createObjectURL(blob)
        const storageElement = document.createElement('a')
        storageElement.style.display = 'none'
        storageElement.href = url
        storageElement.download = name
        document.body.appendChild(storageElement)
        storageElement.click()
        setTimeout(() => {
            document.body.removeChild(storageElement)
            window.URL.revokeObjectURL(url)
        }, 100)
    }
}
const gamepadAPI = {
    controller: {},
    turbo: true,
    connect: function (evt) {
        if (navigator.getGamepads()[0] != null) {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.turbo = true;
        } else if (navigator.getGamepads()[1] != null) {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.turbo = true;
        } else if (navigator.getGamepads()[2] != null) {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.turbo = true;
        } else if (navigator.getGamepads()[3] != null) {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.turbo = true;
        }
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i] === null) {
                continue;
            }
            if (!gamepads[i].connected) {
                continue;
            }
        }
    },
    disconnect: function (evt) {
        gamepadAPI.turbo = false;
        delete gamepadAPI.controller;
    },
    update: function () {
        gamepadAPI.controller = navigator.getGamepads()[0]
        gamepadAPI.buttonsCache = [];// clear the buttons cache
        for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {// move the buttons status from the previous frame to the cache
            gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
        }
        gamepadAPI.buttonsStatus = [];// clear the buttons status
        var c = gamepadAPI.controller || {}; // get the gamepad object
        var pressed = [];
        if (c.buttons) {
            for (var b = 0, t = c.buttons.length; b < t; b++) {// loop through buttons and push the pressed ones to the array
                if (c.buttons[b].pressed) {
                    pressed.push(gamepadAPI.buttons[b]);
                }
            }
        }
        var axes = [];
        if (c.axes) {
            for (var a = 0, x = c.axes.length; a < x; a++) {// loop through axes and push their values to the array
                axes.push(c.axes[a].toFixed(2));
            }
        }
        gamepadAPI.axesStatus = axes;// assign received values
        gamepadAPI.buttonsStatus = pressed;
        // console.log(pressed); // return buttons for debugging purposes
        return pressed;
    },
    buttonPressed: function (button, hold) {
        var newPress = false;
        for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {// loop through pressed buttons
            if (gamepadAPI.buttonsStatus[i] == button) {// if we found the button we're looking for...
                newPress = true;// set the boolean variable to true
                if (!hold) {// if we want to check the single press
                    for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {// loop through the cached states from the previous frame
                        if (gamepadAPI.buttonsCache[j] == button) { // if the button was already pressed, ignore new press
                            newPress = false;
                        }
                    }
                }
            }
        }
        return newPress;
    },
    buttons: [
        'A', 'B', 'X', 'Y', 'LB', 'RB', 'Left-Trigger', 'Right-Trigger', 'Back', 'Start', 'Axis-Left', 'Axis-Right', 'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right', "Power"
    ],
    buttonsCache: [],
    buttonsStatus: [],
    axesStatus: []
};
let canvas
let canvas_context
let keysPressed = {}
let FLEX_engine
let TIP_engine = {}
let XS_engine
let YS_engine
class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.radius = 0
    }
    pointDistance(point) {
        return (new LineOP(this, point, "transparent", 0)).hypotenuse()
    }
}

class Vector { // vector math and physics if you prefer this over vector components on circles
    constructor(object = (new Point(0, 0)), xmom = 0, ymom = 0) {
        this.xmom = xmom
        this.ymom = ymom
        this.object = object
    }
    isToward(point) {
        let link = new LineOP(this.object, point)
        let dis1 = link.squareDistance()
        let dummy = new Point(this.object.x + this.xmom, this.object.y + this.ymom)
        let link2 = new LineOP(dummy, point)
        let dis2 = link2.squareDistance()
        if (dis2 < dis1) {
            return true
        } else {
            return false
        }
    }
    rotate(angleGoal) {
        let link = new Line(this.xmom, this.ymom, 0, 0)
        let length = link.hypotenuse()
        let x = (length * Math.cos(angleGoal))
        let y = (length * Math.sin(angleGoal))
        this.xmom = x
        this.ymom = y
    }
    magnitude() {
        return (new Line(this.xmom, this.ymom, 0, 0)).hypotenuse()
    }
    normalize(size = 1) {
        let magnitude = this.magnitude()
        this.xmom /= magnitude
        this.ymom /= magnitude
        this.xmom *= size
        this.ymom *= size
    }
    multiply(vect) {
        let point = new Point(0, 0)
        let end = new Point(this.xmom + vect.xmom, this.ymom + vect.ymom)
        return point.pointDistance(end)
    }
    add(vect) {
        return new Vector(this.object, this.xmom + vect.xmom, this.ymom + vect.ymom)
    }
    subtract(vect) {
        return new Vector(this.object, this.xmom - vect.xmom, this.ymom - vect.ymom)
    }
    divide(vect) {
        return new Vector(this.object, this.xmom / vect.xmom, this.ymom / vect.ymom) //be careful with this, I don't think this is right
    }
    draw() {
        let dummy = new Point(this.object.x + this.xmom, this.object.y + this.ymom)
        let link = new LineOP(this.object, dummy, "#FFFFFF", 1)
        link.draw()
    }
}
class Line {
    constructor(x, y, x2, y2, color, width) {
        this.x1 = x
        this.y1 = y
        this.x2 = x2
        this.y2 = y2
        this.color = color
        this.width = width
    }
    angle() {
        return Math.atan2(this.y1 - this.y2, this.x1 - this.x2)
    }
    squareDistance() {
        let xdif = this.x1 - this.x2
        let ydif = this.y1 - this.y2
        let squareDistance = (xdif * xdif) + (ydif * ydif)
        return squareDistance
    }
    hypotenuse() {
        let xdif = this.x1 - this.x2
        let ydif = this.y1 - this.y2
        let hypotenuse = (xdif * xdif) + (ydif * ydif)
        if (hypotenuse < 10000000 - 1) {
            if (hypotenuse > 1000) {
                return squaretable[`${Math.round(10 * Math.round((hypotenuse * .1)))}`]
            } else {
                return squaretable[`${Math.round(hypotenuse)}`]
            }
        } else {
            return Math.sqrt(hypotenuse)
        }
    }
    draw() {
        let linewidthstorage = canvas_context.lineWidth
        canvas_context.strokeStyle = this.color
        canvas_context.lineWidth = this.width
        canvas_context.beginPath()
        canvas_context.moveTo(this.x1, this.y1)
        canvas_context.lineTo(this.x2, this.y2)
        canvas_context.stroke()
        canvas_context.lineWidth = linewidthstorage
    }
}
function findIntersections(circle, line) {
    const { x: h, y: k, radius: r } = circle;
    const { m, b } = line.getSlopeIntercept();
    const A = 1 + m * m;
    const B = 2 * (m * b - m * k - h);
    const C = h * h + k * k + b * b - 2 * b * k - r * r;
    const discriminant = B * B - 4 * A * C;
    if (discriminant < 0) {
        return [];
    }
    const x1 = (-B + Math.sqrt(discriminant)) / (2 * A);
    const x2 = (-B - Math.sqrt(discriminant)) / (2 * A);
    const y1 = m * x1 + b;
    const y2 = m * x2 + b;

    return [
        { x: x1, y: y1 },
        { x: x2, y: y2 }
    ];
}
function doesIntersect(circle, line) {
    const { x: h, y: k, radius: r } = circle;
    const { m, b } = line.getSlopeIntercept();

    // Debug logs to check values
    console.log(`Circle: center=(${h}, ${k}), radius=${r}`);
    console.log(`Line: slope=${m}, y-intercept=${b}`);

    // Coefficients of the quadratic equation ax^2 + bx + c = 0
    const A = 1 + m * m;
    const B = 2 * (m * b - m * k - h);
    const C = h * h + k * k + b * b - 2 * b * k - r * r;

    // Calculate the discriminant
    const discriminant = B * B - 4 * A * C;

    // Debug log for the discriminant
    console.log(`Discriminant: ${discriminant}`);

    // If discriminant is negative, no real intersection
    return discriminant >= 0;
}

function inteceptCircleLineSeg(circle, line) {
    var a, b, c, d, u1, u2, ret, retobject, rettarget, v1, v2;
    v1 = {};
    v2 = {};
    v1.x = line.target.x - line.object.x;
    v1.y = line.target.y - line.object.y;
    v2.x = line.object.x - circle.x;
    v2.y = line.object.y - circle.y;
    b = (v1.x * v2.x + v1.y * v2.y);
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    if (isNaN(d)) { // no intercept
        return [];
    }
    u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
    u2 = (b + d) / c;
    retobject = {};   // return points
    rettarget = {}
    ret = []; // return array
    if (u1 <= 1 && u1 >= 0) {  // add point if on the line segment
        retobject.x = line.object.x + v1.x * u1;
        retobject.y = line.object.y + v1.y * u1;
        ret[0] = retobject;
    }
    if (u2 <= 1 && u2 >= 0) {  // second add point if on the line segment
        rettarget.x = line.object.x + v1.x * u2;
        rettarget.y = line.object.y + v1.y * u2;
        ret[ret.length] = rettarget;
    }
    return ret;
}




class LineOP {
    constructor(object, target, color, width) {
        this.object = object
        this.target = target
        this.color = color
        this.width = width
    }
    doesPerimeterTouch(circle) {
        return inteceptCircleLineSeg(circle, this).length > 0
    }
    crashPoint(circle) {
        return inteceptCircleLineSeg(circle, this)
    }
    getSlopeIntercept() {
        const m = (this.target.y - this.object.y) / (this.target.x - this.object.x);
        const b = this.object.y - m * this.object.x;
        return { m, b };
    }
    move() { }
    intersects(line) {
        console.log(line)
        var det, gm, lm;
        det = (this.target.x - this.object.x) * (line.target.y - line.object.y) - (line.target.x - line.object.x) * (this.target.y - this.object.y);
        if (det === 0) {
            return false;
        } else {
            lm = ((line.target.y - line.object.y) * (line.target.x - this.object.x) + (line.object.x - line.target.x) * (line.target.y - this.object.y)) / det;
            gm = ((this.object.y - this.target.y) * (line.target.x - this.object.x) + (this.target.x - this.object.x) * (line.target.y - this.object.y)) / det;
            return (0 < lm && lm < 1) && (0 < gm && gm < 1);
        }
    }
    squareDistance() {
        let xdif = this.object.x - this.target.x
        let ydif = this.object.y - this.target.y
        let squareDistance = (xdif * xdif) + (ydif * ydif)
        return squareDistance
    }
    hypotenuse() {
        let xdif = this.object.x - this.target.x
        let ydif = this.object.y - this.target.y
        let hypotenuse = (xdif * xdif) + (ydif * ydif)
        if (hypotenuse < 10000000 - 1) {
            if (hypotenuse > 1000) {
                return squaretable[`${Math.round(10 * Math.round((hypotenuse * .1)))}`]
            } else {
                return squaretable[`${Math.round(hypotenuse)}`]
            }
        } else {
            return Math.sqrt(hypotenuse)
        }
    }
    angle() {
        return Math.atan2(this.object.y - this.target.y, this.object.x - this.target.x)
    }
    draw() {
        let linewidthstorage = canvas_context.lineWidth
        canvas_context.strokeStyle = this.color
        canvas_context.lineWidth = this.width
        canvas_context.beginPath()
        canvas_context.moveTo(this.object.x, this.object.y)
        canvas_context.lineTo(this.target.x, this.target.y)
        canvas_context.stroke()
        canvas_context.lineWidth = linewidthstorage
    }
}
class Rectangle {
    constructor(x, y, width, height, color, fill = 1, stroke = 0, strokeWidth = 1) {
        this.x = x
        this.y = y
        this.height = height
        this.width = width
        this.color = color
        this.xmom = 0
        this.ymom = 0
        this.stroke = stroke
        this.strokeWidth = strokeWidth
        this.fill = fill
    }
    draw() {
        canvas_context.fillStyle = this.color
        canvas_context.fillRect(this.x, this.y, this.width, this.height)
    }
    move() {
        this.x += this.xmom
        this.y += this.ymom
    }
    isPointInside(point) {
        if (point.x >= this.x) {
            if (point.y >= this.y) {
                if (point.x <= this.x + this.width) {
                    if (point.y <= this.y + this.height) {
                        return true
                    }
                }
            }
        }
        return false
    }
    doesPerimeterTouch(point) {
        if (point.x + point.radius >= this.x) {
            if (point.y + point.radius >= this.y) {
                if (point.x - point.radius <= this.x + this.width) {
                    if (point.y - point.radius <= this.y + this.height) {
                        return true
                    }
                }
            }
        }
        return false
    }
}
class Circle {
    constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.xmom = xmom
        this.ymom = ymom
        this.friction = friction
        this.reflect = reflect
        this.strokeWidth = strokeWidth
        this.strokeColor = strokeColor
    }
    draw() {
        canvas_context.lineWidth = this.strokeWidth
        canvas_context.strokeStyle = this.color
        canvas_context.beginPath();
        if (this.radius > 0) {
            canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
            canvas_context.fillStyle = this.color
            canvas_context.fill()
            canvas_context.stroke();
        } else {
            // console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
        }
    }
    move() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.x += this.xmom
        this.y += this.ymom
    }
    unmove() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.x -= this.xmom
        this.y -= this.ymom
    }
    frictiveMove() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.x += this.xmom
        this.y += this.ymom
        this.xmom *= this.friction
        this.ymom *= this.friction
    }
    frictiveunMove() {
        if (this.reflect == 1) {
            if (this.x + this.radius > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.y + this.radius > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.x - this.radius < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.y - this.radius < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.xmom /= this.friction
        this.ymom /= this.friction
        this.x -= this.xmom
        this.y -= this.ymom
    }
    isPointInside(point) {
        this.areaY = point.y - this.y
        this.areaX = point.x - this.x
        if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
            return true
        }
        return false
    }
    doesPerimeterTouch(point) {
        this.areaY = point.y - this.y
        this.areaX = point.x - this.x
        if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
            return true
        }
        return false
    }
}
class Polygon {
    constructor(x, y, size, color, sides = 3, xmom = 0, ymom = 0, angle = 0, reflect = 0) {
        if (sides < 2) {
            sides = 2
        }
        this.reflect = reflect
        this.xmom = xmom
        this.ymom = ymom
        this.body = new Circle(x, y, size - (size * .293), "transparent")
        this.nodes = []
        this.angle = angle
        this.size = size
        this.color = color
        this.angleIncrement = (Math.PI * 2) / sides
        this.sides = sides
        for (let t = 0; t < sides; t++) {
            let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
            this.nodes.push(node)
            this.angle += this.angleIncrement
        }
    }
    isPointInside(point) { // rough approximation
        this.body.radius = this.size - (this.size * .293)
        if (this.sides <= 2) {
            return false
        }
        this.areaY = point.y - this.body.y
        this.areaX = point.x - this.body.x
        if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.body.radius * this.body.radius)) {
            return true
        }
        return false
    }
    move() {
        if (this.reflect == 1) {
            if (this.body.x > canvas.width) {
                if (this.xmom > 0) {
                    this.xmom *= -1
                }
            }
            if (this.body.y > canvas.height) {
                if (this.ymom > 0) {
                    this.ymom *= -1
                }
            }
            if (this.body.x < 0) {
                if (this.xmom < 0) {
                    this.xmom *= -1
                }
            }
            if (this.body.y < 0) {
                if (this.ymom < 0) {
                    this.ymom *= -1
                }
            }
        }
        this.body.x += this.xmom
        this.body.y += this.ymom
    }
    draw() {
        this.nodes = []
        this.angleIncrement = (Math.PI * 2) / this.sides
        this.body.radius = this.size - (this.size * .293)
        for (let t = 0; t < this.sides; t++) {
            let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
            this.nodes.push(node)
            this.angle += this.angleIncrement
        }
        canvas_context.strokeStyle = this.color
        canvas_context.fillStyle = this.color
        canvas_context.lineWidth = 0
        canvas_context.beginPath()
        canvas_context.moveTo(this.nodes[0].x, this.nodes[0].y)
        for (let t = 1; t < this.nodes.length; t++) {
            canvas_context.lineTo(this.nodes[t].x, this.nodes[t].y)
        }
        canvas_context.lineTo(this.nodes[0].x, this.nodes[0].y)
        canvas_context.fill()
        canvas_context.stroke()
        canvas_context.closePath()
    }
}
class Shape {
    constructor(shapes) {
        this.shapes = shapes
    }
    draw() {
        for (let t = 0; t < this.shapes.length; t++) {
            this.shapes[t].draw()
        }
    }
    move() {
        if (typeof this.xmom != "number") {
            this.xmom = 0
        }
        if (typeof this.ymom != "number") {
            this.ymom = 0
        }
        for (let t = 0; t < this.shapes.length; t++) {
            this.shapes[t].x += this.xmom
            this.shapes[t].y += this.ymom
            this.shapes[t].draw()
        }
    }
    isPointInside(point) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (this.shapes[t].isPointInside(point)) {
                return true
            }
        }
        return false
    }
    doesPerimeterTouch(point) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (this.shapes[t].doesPerimeterTouch(point)) {
                return true
            }
        }
        return false
    }
    innerShape(point) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (this.shapes[t].doesPerimeterTouch(point)) {
                return this.shapes[t]
            }
        }
        return false
    }
    isInsideOf(box) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (box.isPointInside(this.shapes[t])) {
                return true
            }
        }
        return false
    }
    adjustByFromDisplacement(x, y) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (typeof this.shapes[t].fromRatio == "number") {
                this.shapes[t].x += x * this.shapes[t].fromRatio
                this.shapes[t].y += y * this.shapes[t].fromRatio
            }
        }
    }
    adjustByToDisplacement(x, y) {
        for (let t = 0; t < this.shapes.length; t++) {
            if (typeof this.shapes[t].toRatio == "number") {
                this.shapes[t].x += x * this.shapes[t].toRatio
                this.shapes[t].y += y * this.shapes[t].toRatio
            }
        }
    }
    mixIn(arr) {
        for (let t = 0; t < arr.length; t++) {
            for (let k = 0; k < arr[t].shapes.length; k++) {
                this.shapes.push(arr[t].shapes[k])
            }
        }
    }
    push(object) {
        this.shapes.push(object)
    }
}

class Spring {
    constructor(x, y, radius, color, body = 0, length = 1, gravity = 0, width = 1) {
        if (body == 0) {
            this.body = new Circle(x, y, radius, color)
            this.anchor = new Circle(x, y, radius, color)
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
            this.length = length
        } else {
            this.body = body
            this.anchor = new Circle(x, y, radius, color)
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
            this.length = length
        }
        this.gravity = gravity
        this.width = width
    }
    balance() {
        this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
        if (this.beam.hypotenuse() < this.length) {
            this.body.xmom += (this.body.x - this.anchor.x) / this.length
            this.body.ymom += (this.body.y - this.anchor.y) / this.length
            this.anchor.xmom -= (this.body.x - this.anchor.x) / this.length
            this.anchor.ymom -= (this.body.y - this.anchor.y) / this.length
        } else {
            this.body.xmom -= (this.body.x - this.anchor.x) / this.length
            this.body.ymom -= (this.body.y - this.anchor.y) / this.length
            this.anchor.xmom += (this.body.x - this.anchor.x) / this.length
            this.anchor.ymom += (this.body.y - this.anchor.y) / this.length
        }
        let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
        let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
        this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
        this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
        this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
        this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
    }
    draw() {
        this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
        this.beam.draw()
        this.body.draw()
        this.anchor.draw()
    }
    move() {
        this.anchor.ymom += this.gravity
        this.anchor.move()
    }

}
class SpringOP {
    constructor(body, anchor, length, width = 3, color = body.color) {
        this.body = body
        this.anchor = anchor
        this.beam = new LineOP(body, anchor, color, width)
        this.length = length
    }
    balance() {
        if (this.beam.hypotenuse() < this.length) {
            this.body.xmom += ((this.body.x - this.anchor.x) / this.length)
            this.body.ymom += ((this.body.y - this.anchor.y) / this.length)
            this.anchor.xmom -= ((this.body.x - this.anchor.x) / this.length)
            this.anchor.ymom -= ((this.body.y - this.anchor.y) / this.length)
        } else if (this.beam.hypotenuse() > this.length) {
            this.body.xmom -= (this.body.x - this.anchor.x) / (this.length)
            this.body.ymom -= (this.body.y - this.anchor.y) / (this.length)
            this.anchor.xmom += (this.body.x - this.anchor.x) / (this.length)
            this.anchor.ymom += (this.body.y - this.anchor.y) / (this.length)
        }

        let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
        let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
        this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
        this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
        this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
        this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
    }
    draw() {
        this.beam.draw()
    }
    move() {
        //movement of SpringOP objects should be handled separate from their linkage, to allow for many connections, balance here with this object, move nodes independently
    }
}

class Color {
    constructor(baseColor, red = -1, green = -1, blue = -1, alpha = 1) {
        this.hue = baseColor
        if (red != -1 && green != -1 && blue != -1) {
            this.r = red
            this.g = green
            this.b = blue
            if (alpha != 1) {
                if (alpha < 1) {
                    this.alpha = alpha
                } else {
                    this.alpha = alpha / 255
                    if (this.alpha > 1) {
                        this.alpha = 1
                    }
                }
            }
            if (this.r > 255) {
                this.r = 255
            }
            if (this.g > 255) {
                this.g = 255
            }
            if (this.b > 255) {
                this.b = 255
            }
            if (this.r < 0) {
                this.r = 0
            }
            if (this.g < 0) {
                this.g = 0
            }
            if (this.b < 0) {
                this.b = 0
            }
        } else {
            this.r = 0
            this.g = 0
            this.b = 0
        }
    }
    normalize() {
        if (this.r > 255) {
            this.r = 255
        }
        if (this.g > 255) {
            this.g = 255
        }
        if (this.b > 255) {
            this.b = 255
        }
        if (this.r < 0) {
            this.r = 0
        }
        if (this.g < 0) {
            this.g = 0
        }
        if (this.b < 0) {
            this.b = 0
        }
    }
    randomLight() {
        var letters = '0123456789ABCDEF';
        var hash = '#';
        for (var i = 0; i < 6; i++) {
            hash += letters[(Math.floor(Math.random() * 12) + 4)];
        }
        var color = new Color(hash, 55 + Math.random() * 200, 55 + Math.random() * 200, 55 + Math.random() * 200)
        return color;
    }
    randomDark() {
        var letters = '0123456789ABCDEF';
        var hash = '#';
        for (var i = 0; i < 6; i++) {
            hash += letters[(Math.floor(Math.random() * 12))];
        }
        var color = new Color(hash, Math.random() * 200, Math.random() * 200, Math.random() * 200)
        return color;
    }
    random() {
        var letters = '0123456789ABCDEF';
        var hash = '#';
        for (var i = 0; i < 6; i++) {
            hash += letters[(Math.floor(Math.random() * 16))];
        }
        var color = new Color(hash, Math.random() * 255, Math.random() * 255, Math.random() * 255)
        return color;
    }
}
class Softbody { //buggy, spins in place
    constructor(x, y, radius, color, members = 10, memberLength = 5, force = 10, gravity = 0) {
        this.springs = []
        this.pin = new Circle(x, y, radius, color)
        this.spring = new Spring(x, y, radius, color, this.pin, memberLength, gravity)
        this.springs.push(this.spring)
        for (let k = 0; k < members; k++) {
            this.spring = new Spring(x, y, radius, color, this.spring.anchor, memberLength, gravity)
            if (k < members - 1) {
                this.springs.push(this.spring)
            } else {
                this.spring.anchor = this.pin
                this.springs.push(this.spring)
            }
        }
        this.forceConstant = force
        this.centroid = new Point(0, 0)
    }
    circularize() {
        this.xpoint = 0
        this.ypoint = 0
        for (let s = 0; s < this.springs.length; s++) {
            this.xpoint += (this.springs[s].anchor.x / this.springs.length)
            this.ypoint += (this.springs[s].anchor.y / this.springs.length)
        }
        this.centroid.x = this.xpoint
        this.centroid.y = this.ypoint
        this.angle = 0
        this.angleIncrement = (Math.PI * 2) / this.springs.length
        for (let t = 0; t < this.springs.length; t++) {
            this.springs[t].body.x = this.centroid.x + (Math.cos(this.angle) * this.forceConstant)
            this.springs[t].body.y = this.centroid.y + (Math.sin(this.angle) * this.forceConstant)
            this.angle += this.angleIncrement
        }
    }
    balance() {
        for (let s = this.springs.length - 1; s >= 0; s--) {
            this.springs[s].balance()
        }
        this.xpoint = 0
        this.ypoint = 0
        for (let s = 0; s < this.springs.length; s++) {
            this.xpoint += (this.springs[s].anchor.x / this.springs.length)
            this.ypoint += (this.springs[s].anchor.y / this.springs.length)
        }
        this.centroid.x = this.xpoint
        this.centroid.y = this.ypoint
        for (let s = 0; s < this.springs.length; s++) {
            this.link = new Line(this.centroid.x, this.centroid.y, this.springs[s].anchor.x, this.springs[s].anchor.y, 0, "transparent")
            if (this.link.hypotenuse() != 0) {
                this.springs[s].anchor.xmom += (((this.springs[s].anchor.x - this.centroid.x) / (this.link.hypotenuse()))) * this.forceConstant
                this.springs[s].anchor.ymom += (((this.springs[s].anchor.y - this.centroid.y) / (this.link.hypotenuse()))) * this.forceConstant
            }
        }
        for (let s = 0; s < this.springs.length; s++) {
            this.springs[s].move()
        }
        for (let s = 0; s < this.springs.length; s++) {
            this.springs[s].draw()
        }
    }
}
class Observer {
    constructor(x, y, radius, color, range = 100, rays = 10, angle = (Math.PI * .125)) {
        this.body = new Circle(x, y, radius, color)
        this.color = color
        this.ray = []
        this.rayrange = range
        this.globalangle = Math.PI
        this.gapangle = angle
        this.currentangle = 0
        this.obstacles = []
        this.raymake = rays
    }
    beam() {
        this.currentangle = this.gapangle / 2
        for (let k = 0; k < this.raymake; k++) {
            this.currentangle += (this.gapangle / Math.ceil(this.raymake / 2))
            let ray = new Circle(this.body.x, this.body.y, 1, "white", (((Math.cos(this.globalangle + this.currentangle)))), (((Math.sin(this.globalangle + this.currentangle)))))
            ray.collided = 0
            ray.lifespan = this.rayrange - 1
            this.ray.push(ray)
        }
        for (let f = 0; f < this.rayrange; f++) {
            for (let t = 0; t < this.ray.length; t++) {
                if (this.ray[t].collided < 1) {
                    this.ray[t].move()
                    for (let q = 0; q < this.obstacles.length; q++) {
                        if (this.obstacles[q].isPointInside(this.ray[t])) {
                            this.ray[t].collided = 1
                        }
                    }
                }
            }
        }
    }
    draw() {
        this.beam()
        this.body.draw()
        canvas_context.lineWidth = 1
        canvas_context.fillStyle = this.color
        canvas_context.strokeStyle = this.color
        canvas_context.beginPath()
        canvas_context.moveTo(this.body.x, this.body.y)
        for (let y = 0; y < this.ray.length; y++) {
            canvas_context.lineTo(this.ray[y].x, this.ray[y].y)
            canvas_context.lineTo(this.body.x, this.body.y)
        }
        canvas_context.stroke()
        canvas_context.fill()
        this.ray = []
    }
}
function setUp(canvas_pass, style = "#000000") {
    canvas = canvas_pass
    video_recorder = new CanvasCaptureToWEBM(canvas, 4500000);
    canvas_context = canvas.getContext('2d');
    canvas.style.background = style
    window.setInterval(function () {
        main()

        if (keysPressed['-'] && recording == 0) {
            recording = 1
            video_recorder.record()
        }
        if (keysPressed['='] && recording == 1) {
            recording = 0
            video_recorder.stop()
            video_recorder.download('modopow game.webm')
        }
    }, 34)
    document.addEventListener('keydown', (event) => {
        keysPressed[event.key] = true;
    });
    document.addEventListener('keyup', (event) => {
        delete keysPressed[event.key];
    });
    window.addEventListener('pointerdown', e => {
        FLEX_engine = canvas.getBoundingClientRect();
        XS_engine = e.clientX - FLEX_engine.left;
        YS_engine = e.clientY - FLEX_engine.top;
        TIP_engine.x = XS_engine - translator.x
        TIP_engine.y = YS_engine - translator.y
        TIP_engine.body = TIP_engine

        // if (psybean.body.isPointInside(TIP_engine)) {
        //     psybean.selected = 1
        //     sluggernaut.selected = 0
        //     pomao.selected = 0
        //     missileaneous.selected = 0
        //     guy.selected = 0
        //     return
        // }
        // if (players[0].body.isPointInside(TIP_engine)) {
        // players[0].selected = 1
        //     players[1].selected = 0
        //     return
        // }
        // if (pomao.body.isPointInside(TIP_engine)) {
        //     psybean.selected = 0
        //     sluggernaut.selected = 0
        //     pomao.selected = 1
        //     missileaneous.selected = 0
        //     guy.selected = 0
        //     return
        // }
        // if (missileaneous.body.isPointInside(TIP_engine)) {
        //     psybean.selected = 0
        //     sluggernaut.selected = 0
        //     pomao.selected = 0
        //     missileaneous.selected = 1
        //     guy.selected = 0
        //     return
        // }
        // if (guy.body.isPointInside(TIP_engine)) {
        //     psybean.selected = 0
        //     sluggernaut.selected = 0
        //     pomao.selected = 0
        //     missileaneous.selected = 0
        //     guy.selected = 1
        //     return
        // }


        if (players[0].selected == 1) {
            for (let t = 0; t < players[0].drops.length; t++) {
                if (players[0].drops[t].dirLock > 0) {
                    return
                }
            }
            players[0].goal = new Point(TIP_engine.x, TIP_engine.y)
        }


        // if (psybean.selected == 1) {
        //     for (let t = 0; t < psybean.drops.length; t++) {
        //         if (psybean.drops[t].dirLock > 0) {
        //             return
        //         }
        //     }
        //     psybean.goal = new Point(TIP_engine.x, TIP_engine.y)
        // } else if (sluggernaut.selected == 1) {

        //     for (let t = 0; t < sluggernaut.drops.length; t++) {
        //         if (sluggernaut.drops[t].dirLock > 0) {
        //             return
        //         }
        //     }
        //     sluggernaut.goal = new Point(TIP_engine.x, TIP_engine.y)
        // } else if (pomao.selected == 1) {

        //     for (let t = 0; t < pomao.drops.length; t++) {
        //         if (pomao.drops[t].dirLock > 0) {
        //             return
        //         }
        //     }
        //     pomao.goal = new Point(TIP_engine.x, TIP_engine.y)
        // } else if (missileaneous.selected == 1) {

        //     for (let t = 0; t < missileaneous.drops.length; t++) {
        //         if (missileaneous.drops[t].dirLock > 0) {
        //             return
        //         }
        //     }
        //     missileaneous.goal = new Point(TIP_engine.x, TIP_engine.y)
        // } else if (guy.selected == 1) {

        //     for (let t = 0; t < guy.drops.length; t++) {
        //         if (guy.drops[t].dirLock > 0) {
        //             return
        //         }
        //     }
        //     guy.goal = new Point(TIP_engine.x, TIP_engine.y)
        // }

        // let circ = new PointCircle(TIP_engine.x, TIP_engine.y, 30)
        // for (let t = 0; t < circs.length; t++) {
        //     circs[t].shiftBy(circ)
        // }
        // circs.push(circ)
        // example usage: if(object.isPointInside(TIP_engine)){ take action }
    });
    window.addEventListener('pointermove', continued_stimuli);
    window.addEventListener('pointerup', e => {
        // window.removeEventListener("pointermove", continued_stimuli);
    })
    function continued_stimuli(e) {
        FLEX_engine = canvas.getBoundingClientRect();
        XS_engine = e.clientX - FLEX_engine.left;
        YS_engine = e.clientY - FLEX_engine.top;
        TIP_engine.x = XS_engine - translator.x
        TIP_engine.y = YS_engine - translator.y
        TIP_engine.body = TIP_engine
    }
}
function gamepad_control(object, speed = 1) { // basic control for objects using the controler
    //         console.log(gamepadAPI.axesStatus[1]*gamepadAPI.axesStatus[0]) //debugging
    if (typeof object.body != 'undefined') {
        if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                object.body.x += (gamepadAPI.axesStatus[0] * speed)
                object.body.y += (gamepadAPI.axesStatus[1] * speed)
            }
        }
    } else if (typeof object != 'undefined') {
        if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                object.x += (gamepadAPI.axesStatus[0] * speed)
                object.y += (gamepadAPI.axesStatus[1] * speed)
            }
        }
    }
}
function control(object, speed = 1) { // basic control for objects
    if (typeof object.body != 'undefined') {
        if (keysPressed['w']) {
            object.body.y -= speed
        }
        if (keysPressed['d']) {
            object.body.x += speed
        }
        if (keysPressed['s']) {
            object.body.y += speed
        }
        if (keysPressed['a']) {
            object.body.x -= speed
        }
    } else if (typeof object != 'undefined') {
        if (keysPressed['w']) {
            object.y -= speed
        }
        if (keysPressed['d']) {
            object.x += speed
        }
        if (keysPressed['s']) {
            object.y += speed
        }
        if (keysPressed['a']) {
            object.x -= speed
        }
    }
}
function getRandomLightColor() { // random color that will be visible on  black background
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[(Math.floor(Math.random() * 12) + 4)];
    }
    return color;
}
function getRandomColor() { // random color
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[(Math.floor(Math.random() * 16) + 0)];
    }
    return color;
}
function getRandomDarkColor() {// color that will be visible on a black background
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[(Math.floor(Math.random() * 12))];
    }
    return color;
}
function castBetween(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
    let limit = granularity
    let shape_array = []
    for (let t = 0; t < limit; t++) {
        let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
        circ.toRatio = t / limit
        circ.fromRatio = (limit - t) / limit
        shape_array.push(circ)
    }
    return (new Shape(shape_array))
}

function castBetweenPoints(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
    let limit = granularity
    let shape_array = []
    for (let t = 0; t < limit; t++) {
        let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
        circ.toRatio = t / limit
        circ.fromRatio = (limit - t) / limit
        shape_array.push(circ)
    }
    return shape_array
}

class Disang {
    constructor(dis, ang) {
        this.dis = dis
        this.angle = ang
    }
}

class BezierHitbox {
    constructor(x, y, cx, cy, ex, ey, color = "red") { // this function takes a starting x,y, a control point x,y, and a end point x,y
        this.color = color
        this.x = x
        this.y = y
        this.cx = cx
        this.cy = cy
        this.ex = ex
        this.ey = ey
        this.metapoint = new Circle((x + cx + ex) / 3, (y + cy + ey) / 3, 3, "#FFFFFF")
        this.granularity = 100
        this.body = [...castBetweenPoints((new Point(this.x, this.y)), (new Point(this.ex, this.ey)), this.granularity, 0)]

        let angle = (new Line(this.x, this.y, this.ex, this.ey)).angle()

        this.angles = []
        for (let t = 0; t < this.granularity; t++) {
            this.angles.push(angle)
        }
        for (let t = 0; t <= 1; t += 1 / this.granularity) {
            this.body.push(this.getQuadraticXY(t))
            this.angles.push(this.getQuadraticAngle(t))
        }
        this.hitbox = []
        for (let t = 0; t < this.body.length; t++) {
            let link = new LineOP(this.body[t], this.metapoint)
            let disang = new Disang(link.hypotenuse(), link.angle() + (Math.PI * 2))
            this.hitbox.push(disang)
        }
        this.constructed = 1
    }
    isPointInside(point) {
        let link = new LineOP(point, this.metapoint)
        let angle = (link.angle() + (Math.PI * 2))
        let dis = link.hypotenuse()
        for (let t = 1; t < this.hitbox.length; t++) {
            if (Math.abs(this.hitbox[t].angle - this.hitbox[t - 1].angle) > 1) {
                continue
            }
            if (angle.between(this.hitbox[t].angle, this.hitbox[t - 1].angle)) {
                if (dis < (this.hitbox[t].dis + this.hitbox[t - 1].dis) * .5) {
                    return true
                }
            }
        }
        return false
    }
    doesPerimeterTouch(point) {
        let link = new LineOP(point, this.metapoint)
        let angle = (link.angle() + (Math.PI * 2))
        let dis = link.hypotenuse()
        for (let t = 1; t < this.hitbox.length; t++) {
            if (Math.abs(this.hitbox[t].angle - this.hitbox[t - 1].angle) > 1) {
                continue
            }
            if (angle.between(this.hitbox[t].angle, this.hitbox[t - 1].angle)) {
                if (dis < ((this.hitbox[t].dis + this.hitbox[t - 1].dis) * .5) + point.radius) {
                    return this.angles[t]
                }
            }
        }
        return false
    }
    draw() {
        this.metapoint.draw()
        let tline = new Line(this.x, this.y, this.ex, this.ey, this.color, 3)
        tline.draw()
        canvas_context.beginPath()
        this.median = new Point((this.x + this.ex) * .5, (this.y + this.ey) * .5)
        let angle = (new LineOP(this.median, this.metapoint)).angle()
        let dis = (new LineOP(this.median, this.metapoint)).hypotenuse()
        canvas_context.bezierCurveTo(this.x, this.y, this.cx - (Math.cos(angle) * dis * .38), this.cy - (Math.sin(angle) * dis * .38), this.ex, this.ey)

        canvas_context.fillStyle = this.color
        canvas_context.strokeStyle = this.color
        canvas_context.lineWidth = 3
        canvas_context.stroke()
    }
    getQuadraticXY(t) {
        return new Point((((1 - t) * (1 - t)) * this.x) + (2 * (1 - t) * t * this.cx) + (t * t * this.ex), (((1 - t) * (1 - t)) * this.y) + (2 * (1 - t) * t * this.cy) + (t * t * this.ey))
    }
    getQuadraticAngle(t) {
        var dx = 2 * (1 - t) * (this.cx - this.x) + 2 * t * (this.ex - this.cx);
        var dy = 2 * (1 - t) * (this.cy - this.y) + 2 * t * (this.ey - this.cy);
        return -Math.atan2(dx, dy) + 0.5 * Math.PI;
    }
}
Number.prototype.between = function (a, b, inclusive) {
    var min = Math.min(a, b),
        max = Math.max(a, b);
    return inclusive ? this >= min && this <= max : this > min && this < max;
}



class Weight {
    constructor(from, to) {
        this.value = this.weight()
        this.from = from
        this.to = to
        this.change = 0
        this.delta = 1
    }
    valueOf() {
        return this.value
    }
    weight() {
        return ((Math.random() - .5) * 2)
    }
    setChange(num) {
        this.change = num
    }
    setWeight(num) {
        this.value = num
    }
}
class Perceptron {
    constructor(inputs) {
        this.bias = ((Math.random() - .5) * 2) / 1
        this.value = this.bias
        this.weights = []
        this.outputConnections = []
        this.inputs = inputs
        this.error = 0
        this.delta = 1
        for (let t = 0; t < this.inputs.length; t++) {
            this.weights.push(this.weight(this.inputs[t]))
        }
        this.z = -1
        this.change = 0
    }
    setError(error) {
        this.error = error
    }
    setDelta(delta) {
        this.delta = delta
        for (let t = 0; t < this.outputConnections.length; t++) {
            this.outputConnections[t].delta = this.delta
        }
    }
    setBias(bias) {
        this.bias = bias
    }
    setChange(num) {
        this.change = num
    }
    weight(link) {
        let weight = new Weight(link, this)
        if (typeof link != "number") {
            link.outputConnections.push(weight)
        }
        return weight
    }
    valueOf() {
        return this.value
    }
    compute(inputs = this.inputs) {
        this.inputs = inputs
        this.value = this.bias
        for (let t = 0; t < inputs.length; t++) {
            if (t > this.weights.length - 1) {
                this.weights.push(this.weight())
                this.value += (inputs[t].valueOf() * this.weights[t].valueOf())
            } else {
                this.value += (inputs[t].valueOf() * this.weights[t].valueOf())
            }
        }
        this.sig()
        // this.gauss()
        return this.value
    }
    relu() {
        this.value = Math.min(Math.max(this.value, perc.reluslime), 1)
    }
    sig() {
        this.value = 1 / (1 + (Math.pow(Math.E, -this.value)))
    }
    gauss() {
        this.value = Math.min(Math.max(Math.abs(this.value), 0.00000001), 1)

    }
}
class Network {
    constructor(inputs, layerSetupArray) {
        this.reluslime = .00001
        this.momentum = .025
        this.learningRate = .0025
        this.setup = layerSetupArray
        this.inputs = inputs
        this.structure = []
        this.outputs = []
        for (let t = 0; t < layerSetupArray.length; t++) {
            let scaffold = []
            for (let k = 0; k < layerSetupArray[t]; k++) {
                let cept
                if (t == 0) {
                    cept = new Perceptron(this.inputs)
                } else {
                    cept = new Perceptron(this.structure[t - 1])
                }
                scaffold.push(cept)
            }
            this.structure.push(scaffold)
        }
        this.lastinputs = [...this.inputs]
        this.lastgoals = [...this.lastinputs]
        this.swap = []
    }

    becomeNetworkFrom(network) { //using a js file with one variable can be good for this
        // console.log(this.structure[0][0].bias)
        for (let t = 0; t < this.structure.length; t++) {
            // console.log("h1")
            for (let k = 0; k < this.structure[t].length; k++) {
                // console.log("h2")
                this.structure[t][k].bias = network.structure[t][k].bias
                for (let w = 0; w < this.structure[t][k].weights.length; w++) {
                    // console.log("h3")
                    this.structure[t][k].weights[w].setWeight(network.structure[t][k][w].valueOf())
                }
            }
        }
        // console.log(this.structure[0][0].bias)
    }
    log() {
        let json = {}
        json.structure = []
        json.setup = [...this.setup]
        for (let t = 0; t < this.structure.length; t++) {
            json.structure.push({})
            for (let k = 0; k < this.structure[t].length; k++) {
                json.structure[t][k] = {}
                json.structure[t][k].bias = this.structure[t][k].bias.valueOf()
                for (let w = 0; w < this.structure[t][k].weights.length; w++) {
                    json.structure[t][k][w] = (this.structure[t][k].weights[w].valueOf())
                }
            }
        }
        console.log(json)
    }
    calculateDeltasSigmoid(goals) {
        for (let t = this.structure.length - 1; t >= 0; t--) {
            const layer = this.structure[t]
            for (let k = 0; k < layer.length; k++) {
                const perceptron = layer[k]
                let output = perceptron.valueOf()
                let error = 0
                if (t === this.structure.length - 1) {
                    error = goals[k] - output;
                } else {
                    for (let k = 0; k < perceptron.outputConnections.length; k++) {
                        const currentConnection = perceptron.outputConnections[k]
                        //console.log(currentConnection)
                        error += currentConnection.to.delta * currentConnection.valueOf()
                    }
                }
                perceptron.setError(error)
                perceptron.setDelta(error * output * (1 - output))
            }
        }
    }
    adjustWeights() {
        for (let t = 0; t < this.structure.length; t++) {
            const layer = this.structure[t]
            for (let k = 0; k < layer.length; k++) {
                const perceptron = layer[k]
                let delta = perceptron.delta
                for (let i = 0; i < perceptron.weights.length; i++) {
                    const connection = perceptron.weights[i]
                    let change = connection.change
                    change = (this.learningRate * delta * perceptron.inputs[i].valueOf()) + (this.momentum * change);
                    connection.setChange(change)
                    connection.setWeight(connection.valueOf() + change)
                }
                perceptron.setBias(perceptron.bias + (this.learningRate * delta))
            }
        }
    }
    clone(nw) {
        let input = nw.inputs
        let perc = new Network(input, nw.setup)
        for (let t = 0; t < nw.structure.length; t++) {
            for (let k = 0; k < nw.structure[t].length; k++) {
                perc.structure[t][k] = new Perceptron([0, 0, 0, 0, 0, 0, 0])
                for (let f = 0; f < nw.structure[t][k].weights.length; f++) {
                    perc.structure[t][k].weights[f] = nw.structure[t][k].weights[f]
                    perc.structure[t][k].bias = nw.structure[t][k].bias
                }
            }
        }
        return perc
    }
    compute(inputs = this.inputs) {
        this.inputs = [...inputs]
        for (let t = 0; t < this.structure.length; t++) {
            for (let k = 0; k < this.structure[t].length; k++) {
                if (t == 0) {
                    this.structure[t][k].compute(this.inputs)
                } else {
                    this.structure[t][k].compute(this.structure[t - 1])
                }
            }
        }
        this.outputs = []
        this.dataoutputs = []
        for (let t = 0; t < this.structure[this.structure.length - 1].length; t++) {
            this.outputs.push(this.structure[this.structure.length - 1][t].valueOf())
            this.dataoutputs.push(new Data(this.structure[this.structure.length - 1][t].valueOf()))
        }
    }
}
class Data {
    constructor(input = -100) {
        this.delta = 0
        this.outputConnections = []
        if (input == -100) {
            this.value = this.weight()
        } else {
            this.value = input
        }
    }
    valueOf() {
        return this.value
    }
    weight() {
        return Math.random() - .5
    }
}

let setup_canvas = document.getElementById('canvas') //getting canvas from document

setUp(setup_canvas) // setting up canvas refrences, starting timer. 

// object instantiation and creation happens here 

class WallSpike {
    constructor(track, length, angle, color) {
        this.track = track
        this.x = this.track.x
        this.y = this.track.y
        this.angle = angle + .0925
        this.color = color
        this.radius = length
    }

    move() { }
    draw() {
        this.life = 9999999
        this.x = this.track.x
        this.y = this.track.y
        // let p = new Circle(this.x - (Math.cos(this.angle - 1) * 8), this.y - (Math.sin(this.angle - 1) * 8), 3, "red")
        // let m = new Circle(this.x - (Math.cos(this.angle - .5) * 8), this.y - (Math.sin(this.angle - .5) * 8), 3, "red")
        // let k = new Circle(this.x - (Math.cos(this.angle - .75) * this.radius), this.y - (Math.sin(this.angle - .75) * this.radius), 3, "white")
        // // p.draw()
        // // m.draw()

        // let p2 = new Circle(this.x - (Math.cos(this.angle + 1) * 8), this.y - (Math.sin(this.angle + 1) * 8), 3, "blue")
        // let m2 = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "blue")
        // let k2 = new Circle(this.x - (Math.cos(this.angle + .75) * this.radius), this.y - (Math.sin(this.angle + .75) * this.radius), 3, "white")
        // p2.draw()
        // m2.draw()

        let p = new Circle(this.x - (Math.cos(this.angle - 1) * -5), this.y - (Math.sin(this.angle - 1) * -5), 3, "red")
        let m = new Circle(this.x - (Math.cos(this.angle - .5) * -5), this.y - (Math.sin(this.angle - .75) * -5), 3, "red")
        let k = new Circle(this.x - (Math.cos(this.angle - .875) * this.radius), this.y - (Math.sin(this.angle - .875) * this.radius), 3, "white")

        let p2 = new Circle(this.x - (Math.cos(this.angle + 1) * -5), this.y - (Math.sin(this.angle + 1) * -5), 3, "blue")
        let m2 = new Circle(this.x - (Math.cos(this.angle + .5) * -5), this.y - (Math.sin(this.angle + .5) * -5), 3, "blue")
        let k2 = new Circle(this.x - (Math.cos(this.angle + .75) * this.radius), this.y - (Math.sin(this.angle + .75) * this.radius), 3, "white")


        let l1 = new LineOP(p, k, "gray", 6)
        l1.draw()
        let l2 = new LineOP(m, k, "gray", 6)
        l2.draw()

        let f1 = new LineOP(p2, k2, "gray", 6)
        f1.draw()
        let f2 = new LineOP(m2, k2, "gray", 6)
        f2.draw()

        k2.draw()

        k.draw()

    }
    doesPerimeterTouch(circle) {
        this.life = 9999999
        this.x = this.track.x
        this.y = this.track.y
        let p = new Circle(this.x - (Math.cos(this.angle - 1) * -5), this.y - (Math.sin(this.angle - 1) * -5), 3, "red")
        let m = new Circle(this.x - (Math.cos(this.angle - .5) * -5), this.y - (Math.sin(this.angle - .75) * -5), 3, "red")
        let k = new Circle(this.x - (Math.cos(this.angle - .875) * this.radius), this.y - (Math.sin(this.angle - .875) * this.radius), 3, "white")

        let p2 = new Circle(this.x - (Math.cos(this.angle + 1) * -5), this.y - (Math.sin(this.angle + 1) * -5), 3, "blue")
        let m2 = new Circle(this.x - (Math.cos(this.angle + .5) * -5), this.y - (Math.sin(this.angle + .5) * -5), 3, "blue")
        let k2 = new Circle(this.x - (Math.cos(this.angle + .75) * this.radius), this.y - (Math.sin(this.angle + .75) * this.radius), 3, "white")
        let l1 = new LineOP(p, k, "gray", 6)
        // l1.draw()
        let l2 = new LineOP(m, k, "gray", 6)
        // l2.draw()
        let f1 = new LineOP(p2, k2, "gray", 6)
        // f1.draw()
        let f2 = new LineOP(m2, k2, "gray", 6)
        // f2.draw()
        // k2.draw()
        // k.draw()
        // console.log(circle)
        let wet = 0
        if (l1.doesPerimeterTouch(circle)) {
            wet = 1
        }
        if (l2.doesPerimeterTouch(circle)) {
            wet = 1
        }
        if (f1.doesPerimeterTouch(circle)) {
            wet = 1
        }
        if (f2.doesPerimeterTouch(circle)) {
            wet = 1
        }
        let trapper = 0
        if (circle == players[0].body) {
            trapper = 1
        }
        if (wet == 1) {
            for (let z = 0; z < 12; z++) {

                let pc1 = l1.crashPoint(circle)
                let pc2 = l2.crashPoint(circle)
                let pc3 = f1.crashPoint(circle)
                let pc4 = f2.crashPoint(circle)
                if (trapper == 0) {

                    if (pc1.length > 0) {
                        let l = new LineOP(pc1[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    } else if (pc2.length > 0) {
                        let l = new LineOP(pc2[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    } else if (pc3.length > 0) {
                        let l = new LineOP(pc3[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    } else if (pc4.length > 0) {
                        let l = new LineOP(pc4[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    }
                } else {
                    if (pc1.length > 0) {
                        let l = new LineOP(pc1[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    } else if (pc2.length > 0) {
                        let l = new LineOP(pc2[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    } else if (pc3.length > 0) {
                        let l = new LineOP(pc3[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    } else if (pc4.length > 0) {
                        let l = new LineOP(pc4[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    }

                }
            }



            return true
        }
        return false
    }
}



class YSpike {
    constructor(track, length, angle, color) {
        this.track = track
        this.x = this.track.x
        this.y = this.track.y
        this.angle = angle
        this.color = color
        this.radius = length
    }

    move() { }
    draw() {
        this.x = this.track.x
        this.y = this.track.y
        let p = new Circle(this.x - (Math.cos(this.angle - 1) * 8), this.y - (Math.sin(this.angle - 1) * 8), 3, "red")
        let m = new Circle(this.x - (Math.cos(this.angle - .5) * 8), this.y - (Math.sin(this.angle - .5) * 8), 3, "red")
        let k = new Circle(this.x - (Math.cos(this.angle - .75) * this.radius), this.y - (Math.sin(this.angle - .75) * this.radius), 3, "white")
        // p.draw()
        // m.draw()

        let p2 = new Circle(this.x - (Math.cos(this.angle + 1) * 8), this.y - (Math.sin(this.angle + 1) * 8), 3, "blue")
        let m2 = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "blue")
        let k2 = new Circle(this.x - (Math.cos(this.angle + .75) * this.radius), this.y - (Math.sin(this.angle + .75) * this.radius), 3, "white")
        // p2.draw()
        // m2.draw()

        let l1 = new LineOP(p, k, "gray", 6)
        l1.draw()
        let l2 = new LineOP(m, k, "gray", 6)
        l2.draw()

        let f1 = new LineOP(p2, k2, "gray", 6)
        f1.draw()
        let f2 = new LineOP(m2, k2, "gray", 6)
        f2.draw()

        k2.draw()

        k.draw()

    }
    doesPerimeterTouch(circle) {
        let p = new Circle(this.x - (Math.cos(this.angle - 1) * 8), this.y - (Math.sin(this.angle - 1) * 8), 3, "red")
        let m = new Circle(this.x - (Math.cos(this.angle - .5) * 8), this.y - (Math.sin(this.angle - .75) * 8), 3, "red")
        let k = new Circle(this.x - (Math.cos(this.angle - .875) * this.radius), this.y - (Math.sin(this.angle - .875) * this.radius), 3, "white")

        let p2 = new Circle(this.x - (Math.cos(this.angle + 1) * 8), this.y - (Math.sin(this.angle + 1) * 8), 3, "blue")
        let m2 = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "blue")
        let k2 = new Circle(this.x - (Math.cos(this.angle + .75) * this.radius), this.y - (Math.sin(this.angle + .75) * this.radius), 3, "white")
        let l1 = new LineOP(p, k, "gray", 6)
        // l1.draw()
        let l2 = new LineOP(m, k, "gray", 6)
        // l2.draw()
        let f1 = new LineOP(p2, k2, "gray", 6)
        // f1.draw()
        let f2 = new LineOP(m2, k2, "gray", 6)
        // f2.draw()
        // k2.draw()
        // k.draw()
        console.log(circle)
        let wet = 0
        if (l1.doesPerimeterTouch(circle)) {
            wet = 1
        }
        if (l2.doesPerimeterTouch(circle)) {
            wet = 1
        }
        if (f1.doesPerimeterTouch(circle)) {
            wet = 1
        }
        if (f2.doesPerimeterTouch(circle)) {
            wet = 1
        }
        let trapper = 0
        if (circle == players[0].body) {
            trapper = 1
        }
        if (wet == 1) {
            for (let z = 0; z < 10; z++) {
                for (let k = 0; k < walls.length; k++) {
                    walls[k].doesPerimeterTouch(circle)
                }
                let pc1 = l1.crashPoint(circle)
                let pc2 = l2.crashPoint(circle)
                let pc3 = f1.crashPoint(circle)
                let pc4 = f2.crashPoint(circle)
                if (trapper == 0) {

                    if (pc1.length > 0) {
                        let l = new LineOP(pc1[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    } else if (pc2.length > 0) {
                        let l = new LineOP(pc2[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    } else if (pc3.length > 0) {
                        let l = new LineOP(pc3[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    } else if (pc4.length > 0) {
                        let l = new LineOP(pc4[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    }
                } else {
                    if (pc1.length > 0) {
                        let l = new LineOP(pc1[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    } else if (pc2.length > 0) {
                        let l = new LineOP(pc2[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    } else if (pc3.length > 0) {
                        let l = new LineOP(pc3[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    } else if (pc4.length > 0) {
                        let l = new LineOP(pc4[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    }

                }

                for (let k = 0; k < walls.length; k++) {
                    walls[k].doesPerimeterTouch(circle)
                }
            }



            return true
        }
        return false
    }
}
class BoomSpike {
    constructor(track, length, angle, color) {
        this.track = track
        this.x = this.track.x
        this.y = this.track.y
        this.angle = angle
        this.color = color
        this.radius = length
    }

    move() { }
    draw() {
        this.x = this.track.x
        this.y = this.track.y
        let p = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "red")
        let m = new Circle(this.x - (Math.cos(this.angle - .5) * 8), this.y - (Math.sin(this.angle - .5) * 8), 3, "red")
        let k = new Circle(this.x - (Math.cos(this.angle) * this.radius), this.y - (Math.sin(this.angle) * this.radius), 15, "yellow")
        // p.draw()
        // m.draw()

        // let p2 = new Circle(this.x - (Math.cos(this.angle + 1) * 8), this.y - (Math.sin(this.angle + 1) * 8), 3, "blue")
        // let m2 = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "blue")
        // let k2 = new Circle(this.x - (Math.cos(this.angle + .75) * this.radius), this.y - (Math.sin(this.angle + .75) * this.radius), 3, "white")
        // // p2.draw()
        // m2.draw()

        let l1 = new LineOP(p, k, "red", 6)
        l1.draw()
        let l2 = new LineOP(m, k, "red", 6)
        l2.draw()

        // let f1 = new LineOP(p2, k2, "gray", 6)
        // f1.draw()
        // let f2 = new LineOP(m2, k2, "gray", 6)
        // f2.draw()

        // k2.draw()

        k.draw()

    }
    doesPerimeterTouch(circle) {
        let p = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "red")
        let m = new Circle(this.x - (Math.cos(this.angle - .5) * 8), this.y - (Math.sin(this.angle - .5) * 8), 3, "red")
        let k = new Circle(this.x - (Math.cos(this.angle) * this.radius), this.y - (Math.sin(this.angle) * this.radius), 15, "yellow")

        // let p2 = new Circle(this.x - (Math.cos(this.angle + 1) * 8), this.y - (Math.sin(this.angle + 1) * 8), 3, "blue")
        // let m2 = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "blue")
        // let k2 = new Circle(this.x - (Math.cos(this.angle + .75) * this.radius), this.y - (Math.sin(this.angle + .75) * this.radius), 3, "white")
        let l1 = new LineOP(p, k, "gray", 6)
        // l1.draw()
        let l2 = new LineOP(m, k, "gray", 6)
        // l2.draw()
        // let f1 = new LineOP(p2, k2, "gray", 6)
        // // f1.draw()
        // let f2 = new LineOP(m2, k2, "gray", 6)
        // // f2.draw()
        // k2.draw()
        // k.draw()
        // console.log(circle)
        let wet = 0
        if (k.doesPerimeterTouch(circle)) {
            wet = 1
        }
        if (l1.doesPerimeterTouch(circle)) {
            wet = 1
        }
        if (l2.doesPerimeterTouch(circle)) {
            wet = 1
        }
        // if(f1.doesPerimeterTouch(circle)){
        //     wet = 1
        // }
        // if(f2.doesPerimeterTouch(circle)){
        //     wet = 1
        // }
        let trapper = 0
        if (circle == players[0].body) {
            trapper = 1
        }
        if (wet == 1) {
            for (let z = 0; z < 10; z++) {
                for (let k = 0; k < walls.length; k++) {
                    walls[k].doesPerimeterTouch(circle)
                }
                let pc1 = l1.crashPoint(circle)
                let pc2 = l2.crashPoint(circle)
                // let pc3 = f1.crashPoint(circle)
                // let pc4 = f2.crashPoint(circle)
                if (trapper == 0) {
                    if (pc1.length > 0) {
                        let l = new LineOP(pc1[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    } else if (pc2.length > 0) {
                        let l = new LineOP(pc2[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    }

                } else {

                    if (pc1.length > 0) {
                        let l = new LineOP(pc1[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    } else if (pc2.length > 0) {
                        let l = new LineOP(pc2[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    }
                }
                // }else  if(pc3.length > 0){
                //     circle.x -= (Math.sign(pc3[0].x - circle.x))*1
                //     circle.y -= (Math.sign(pc3[0].y - circle.y))*1
                // }else  if(pc4.length > 0){
                //     circle.x -= (Math.sign(pc4[0].x - circle.x))*1
                //     circle.y -= (Math.sign(pc4[0].y - circle.y))*1
                // }

                for (let k = 0; k < walls.length; k++) {
                    walls[k].doesPerimeterTouch(circle)
                }
            }



            return true
        }
        return false
    }
}

class MeleeSpike {
    constructor(track, length, angle, color) {
        this.track = track
        this.x = this.track.x
        this.y = this.track.y
        this.angle = angle
        this.color = color
        this.radius = length
    }

    move() { }
    draw() {
        this.x = this.track.x
        this.y = this.track.y
        let p = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "gray")
        let m = new Circle(this.x - (Math.cos(this.angle - .5) * 8), this.y - (Math.sin(this.angle - .5) * 8), 3, "gray")
        let k = new Circle(this.x - (Math.cos(this.angle) * this.radius), this.y - (Math.sin(this.angle) * this.radius), 6, "gray")
        // p.draw()
        // m.draw()

        // let p2 = new Circle(this.x - (Math.cos(this.angle + 1) * 8), this.y - (Math.sin(this.angle + 1) * 8), 3, "blue")
        // let m2 = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "blue")
        // let k2 = new Circle(this.x - (Math.cos(this.angle + .75) * this.radius), this.y - (Math.sin(this.angle + .75) * this.radius), 3, "white")
        // // p2.draw()
        // m2.draw()

        let l1 = new LineOP(p, k, "gray", 6)
        l1.draw()
        let l2 = new LineOP(m, k, "gray", 6)
        l2.draw()

        // let f1 = new LineOP(p2, k2, "gray", 6)
        // f1.draw()
        // let f2 = new LineOP(m2, k2, "gray", 6)
        // f2.draw()

        // k2.draw()

        k.draw()

    }
    doesPerimeterTouch(circle) {
        let p = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "gray")
        let m = new Circle(this.x - (Math.cos(this.angle - .5) * 8), this.y - (Math.sin(this.angle - .5) * 8), 3, "gray")
        let k = new Circle(this.x - (Math.cos(this.angle) * this.radius), this.y - (Math.sin(this.angle) * this.radius), 6, "gray")

        // let p2 = new Circle(this.x - (Math.cos(this.angle + 1) * 8), this.y - (Math.sin(this.angle + 1) * 8), 3, "blue")
        // let m2 = new Circle(this.x - (Math.cos(this.angle + .5) * 8), this.y - (Math.sin(this.angle + .5) * 8), 3, "blue")
        // let k2 = new Circle(this.x - (Math.cos(this.angle + .75) * this.radius), this.y - (Math.sin(this.angle + .75) * this.radius), 3, "white")
        let l1 = new LineOP(p, k, "gray", 6)
        // l1.draw()
        let l2 = new LineOP(m, k, "gray", 6)
        // l2.draw()
        // let f1 = new LineOP(p2, k2, "gray", 6)
        // // f1.draw()
        // let f2 = new LineOP(m2, k2, "gray", 6)
        // // f2.draw()
        // k2.draw()
        // k.draw()
        // console.log(circle)
        let wet = 0
        if (k.doesPerimeterTouch(circle)) {
            wet = 1
        }
        if (l1.doesPerimeterTouch(circle)) {
            wet = 1
        }
        if (l2.doesPerimeterTouch(circle)) {
            wet = 1
        }
        // if(f1.doesPerimeterTouch(circle)){
        //     wet = 1
        // }
        // if(f2.doesPerimeterTouch(circle)){
        //     wet = 1
        // }
        let trapper = 0
        if (circle == players[0].body) {
            trapper = 1
        }
        if (wet == 1) {
            for (let z = 0; z < 10; z++) {
                for (let k = 0; k < walls.length; k++) {
                    walls[k].doesPerimeterTouch(circle)
                }




                let pc1 = l1.crashPoint(circle)
                let pc2 = l2.crashPoint(circle)
                // let pc3 = f1.crashPoint(circle)
                // let pc4 = f2.crashPoint(circle)
                if (trapper == 0) {
                    if (pc1.length > 0) {
                        let l = new LineOP(pc1[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    } else if (pc2.length > 0) {
                        let l = new LineOP(pc2[0], circle)
                        circle.x -= Math.cos(l.angle()) * 2
                        circle.y -= Math.sin(l.angle()) * 2
                    }

                } else {

                    if (pc1.length > 0) {
                        let l = new LineOP(pc1[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    } else if (pc2.length > 0) {
                        let l = new LineOP(pc2[0], circle)
                        let a = l.angle()
                        circle.x -= Math.cos(a) * 2
                        circle.y -= Math.sin(a) * 2
                        canvas_context.translate(Math.cos(a) * 2, Math.sin(a) * 2)
                        translator.x += Math.cos(a) * 2
                        translator.y += Math.sin(a) * 2
                    }
                }
                // }else  if(pc3.length > 0){
                //     circle.x -= (Math.sign(pc3[0].x - circle.x))*1
                //     circle.y -= (Math.sign(pc3[0].y - circle.y))*1
                // }else  if(pc4.length > 0){
                //     circle.x -= (Math.sign(pc4[0].x - circle.x))*1
                //     circle.y -= (Math.sign(pc4[0].y - circle.y))*1
                // }

                for (let k = 0; k < walls.length; k++) {
                    walls[k].doesPerimeterTouch(circle)
                }
            }



            return true
        }
        return false
    }
}
class TongueSpike {
    constructor(track, length, angle, color, guy) {
        this.track = track
        this.x = this.track.x
        this.y = this.track.y
        this.guy = guy
        this.angle = angle
        this.color = color
        this.radius = length
        this.k = new Circle(this.x - (Math.cos(this.angle) * this.radius), this.y - (Math.sin(this.angle) * this.radius), 13, "blue")
        this.p = new Circle(this.x - (Math.cos(this.angle) * 16), this.y - (Math.sin(this.angle) * 16), 3, "blue")
    }
    move() { }
    draw() {
        this.x = this.track.x
        this.y = this.track.y
        this.p.x = this.x - (Math.cos(this.angle) * 16)
        this.p.y = this.y - (Math.sin(this.angle) * 16)
        // p.draw()
        // m.draw()
        if (this.radius >= this.maxDis) {
            this.growth = .85
        }
        this.k.x = this.x - (Math.cos(this.angle) * this.radius)
        this.k.y = this.y - (Math.sin(this.angle) * this.radius)
        // let p2 = new Circle(this.x - (Math.cos(this.angle + 1) * 16), this.y - (Math.sin(this.angle + 1) * 16), 3, "blue")
        // let k2 = new Circle(this.x - (Math.cos(this.angle ) * this.radius), this.y - (Math.sin(this.angle + .875) * this.radius), 13, "blue")
        // p2.draw()
        // m2.draw()

        let l1 = new LineOP(this.p, this.k, "Blue", 6)
        l1.draw()

        // let f1 = new LineOP(p2, k2, "Blue", 6)
        // f1.draw()
        // let f2 = new LineOP(m2, k2, "Blue", 6)
        // f2.draw()

        // k2.draw()

        this.k.draw()

    }

    doesPerimeterTouch(circle) {


        this.x = this.track.x
        this.y = this.track.y

        this.k.x = this.x - (Math.cos(this.angle) * this.radius)
        this.k.y = this.y - (Math.sin(this.angle) * this.radius)
        let l1 = new LineOP(this.p, this.k, "Blue", 6)
        l1.draw()

        if (l1.doesPerimeterTouch(circle)) {
            return true
        }
        if (this.k.doesPerimeterTouch(circle)) {
            return true
        }

        return false
    }
}
let translator = { x: 0, y: 0 }
canvas_context.translate(-360 - (1280 - (640 - 360)), -360 - 720)
translator.x -= 360 + (1280 - (640 - 360))
translator.y -= 360 + 720
class Champ {
    constructor(type, team) {
        this.meleeRange = this.meleeRangeMaker(type)
        this.gold = 360
        this.goldtotal = this.gold
        this.team = team
        this.health = this.healthMaker(type)
        this.mana = this.manaMaker(type)
        this.healthRegen = this.healthRegenMaker(type)
        this.manaRegen = this.manaRegenMaker(type)
        this.maxhealth = this.health
        this.maxmana = this.mana
        team.players.push(this)
        this.type = type
        this.activeArts = []
        this.abilities = [this.power1(this.type), this.power2(this.type), this.power3(this.type), this.power4(this.type)]
        this.body = new Circle((1280 - (640 - 360)) * 2, 720 * 2, 32, "red")
        this.basicAttack = this.makeBasic()
        this.goal = this.body
        if (this.type == -1) {
            this.body.radius = 20
            this.body.y += 200
            this.body.x -= 400
        }
        this.cooldowns = [0, 0, 0, 0, 0]
        this.UI = [new Rectangle(400, 660, 60, 60, "#FF00FF"), new Rectangle(460, 660, 60, 60, "#FFff00"), new Rectangle(520, 660, 60, 60, "#00FFff"), new Rectangle(580, 660, 60, 60, "#FFFFFF")]
        this.sleep = -1
        this.step = 0
        this.rate = 0
        this.chunk = 4
        this.speed = this.speedMaker(this.type)
        this.boosts = []
        this.drops = []
        this.slimeToggle = -1
        this.slowedByFloor = 1
        this.selected = 0
    }
    makeBasic() {
        return this.unitmeleeChamp
    }
    manaMaker(type) {
        this.tempHealth = 0
        if (type == -1) {
            this.mana = 400
        }
        if (type == 0) {
            this.mana = 600
        }
        if (type == 1) {
            this.mana = 300
        }
        if (type == 2) {
            this.mana = 400
        }
        if (type == 3) {
            this.mana = 500
        }
        return this.mana
    }

    healthMaker(type) {
        this.tempHealth = 0
        if (type == -1) {
            this.health = 400
        }
        if (type == 0) {
            this.health = 380
        }
        if (type == 1) {
            this.health = 740
        }
        if (type == 2) {
            this.health = 480
        }
        if (type == 3) {
            this.health = 450
        }
        return this.health
    }
    meleeRangeMaker(type) {
        this.tempMeleeRange = 0
        if (type == -1) {
            this.meleeRange = 64
        }
        if (type == 0) {
            this.meleeRange = 110
        }
        if (type == 1) {
            this.meleeRange = 80
        }
        if (type == 2) {
            this.meleeRange = 90
        }
        if (type == 3) {
            this.meleeRange = 90
        }
        return this.meleeRange
    }
    healthRegenMaker(type) {
        this.tempHealthRegen = 0
        if (type == -1) {
            this.healthRegen = 0
        }
        if (type == 0) {
            this.healthRegen = 4 / 100
        }
        if (type == 1) {
            this.healthRegen = 2 / 100
        }
        if (type == 2) {
            this.healthRegen = 3 / 100
        }
        if (type == 3) {
            this.healthRegen = 3 / 100
        }
        return this.healthRegen
    }
    manaRegenMaker(type) {
        this.tempManaRegen = 0
        if (type == -1) {
            this.manaRegen = 0
        }
        if (type == 0) {
            this.manaRegen = 10 / 30
        }
        if (type == 1) {
            this.manaRegen = 2 / 30
        }
        if (type == 2) {
            this.manaRegen = 4 / 30
        }
        if (type == 3) {
            this.manaRegen = 5 / 30
        }
        return this.manaRegen
    }
    speedMaker(type) {
        this.tempSpeed = 0
        if (type == -1) {
            this.speed = 1.5
        }
        if (type == 0) {
            this.speed = 5
        }
        if (type == 1) {
            this.speed = 2
        }
        if (type == 2) {
            this.speed = 4
        }
        if (type == 3) {
            this.speed = 3
        }
        return this.speed
    }
    healthDraw() {
        if (this.health < 0) {
            this.health = 0
        }
        if (this.health > this.maxhealth) {
            this.health = this.maxhealth
        }
        if (this.mana < 0) {
            this.mana = 0
        }
        if (this.mana > this.maxmana) {
            this.mana = this.maxmana
        }
        this.healthBar = new Rectangle(this.body.x - 32, this.body.y - 42, 64 * (this.health / this.maxhealth), 7, "#00ff00")
        this.healthBarBack = new Rectangle(this.body.x - 32, this.body.y - 42, 64, 7, "#000000")
        this.healthBarOut = new Rectangle(this.body.x - 34, this.body.y - 44, 68, 11, "#000000")
        this.healthBarOut.draw()
        this.healthBarBack.draw()
        this.healthBar.draw()
        if (this.type != -1) {

            this.manaBar = new Rectangle(this.body.x - 32, this.body.y - 50, 64 * (this.mana / this.maxmana), 7, "#00ffFF")
            this.manaBarBack = new Rectangle(this.body.x - 32, this.body.y - 50, 64, 7, "#000000")
            this.manaBarOut = new Rectangle(this.body.x - 34, this.body.y - 52, 68, 11, "#000000")
            this.manaBarOut.draw()
            this.manaBarBack.draw()
            this.manaBar.draw()
            let mb = Math.floor(this.maxmana / 100)
            let mbx = (this.maxmana / 100)
            for (let g = 1; g < mb; g++) {
                let x = (this.manaBar.x + ((64 / mb) * g)) - .25
                let rect = new Rectangle(x, this.manaBar.y, .5, 7, "black")
                rect.draw()
            }
        }
        let hb = Math.floor(this.maxhealth / 100)
        let hbx = (this.maxhealth / 100)
        for (let g = 1; g < hb; g++) {
            let x = (this.healthBar.x + ((64 / hb) * g)) - .25
            let rect = new Rectangle(x, this.healthBar.y, .5, 7, "black")
            rect.draw()
        }
        // console.log(this)
    }
    tick() {
        this.health += this.healthRegen
        this.mana += this.manaRegen

        for (let t = 0; t < this.drops.length; t++) {
            if (this.drops[t].dirLock > 0) {
                this.drops[t].dirLock--
                if (this.drops[t].dirLock > 0) {
                } else {
                    this.drops.splice(t, 1)
                }
            }
        }
        for (let t = 0; t < this.boosts.length; t++) {
            if (this.boosts[t].speedDown > 0) {
                this.boosts[t].speedDown--
                if (this.boosts[t].speedDown > 0) {
                } else {
                    this.tempSpeed -= this.boosts[t].dropBy
                    this.boosts.splice(t, 1)
                }
            }
        }
        this.rate++
        if (this.rate > this.chunk) {
            this.step++
            this.rate = 0
        }
        if (this.slimeToggle == 1) {
            this.dropSlime(this)
        }
        this.cooldowns[0]--
        this.cooldowns[1]--
        this.cooldowns[2]--
        this.cooldowns[3]--
        this.cooldowns[4]--

    }
    fieldStuff() {
        for (let t = 0; t < this.activeArts.length; t++) {
            if (this.activeArts[t].moveAngle == 1) {
                this.activeArts[t].angle = ((this.activeArts[t].angle * 10) + (new LineOP(this.last, this.body)).angle()) / 11
            }
            if (this.activeArts[t].root) {
                this.activeArts[t].x = this.activeArts[t].root.x
                this.activeArts[t].y = this.activeArts[t].root.y
            }
            if (this.activeArts[t].maxDis >= 1) {
                let link = new LineOP(this.body, this.activeArts[t])
                if (link.hypotenuse() > this.activeArts[t].maxDis) {
                    this.activeArts[t].x = this.body.x + (Math.cos(link.angle()) * -this.activeArts[t].maxDis)
                    this.activeArts[t].y = this.body.y + (Math.sin(link.angle()) * -this.activeArts[t].maxDis)
                }
                if (this.activeArts[t].radius > this.activeArts[t].maxDis) {
                    this.activeArts[t].radius = this.activeArts[t].maxDis
                }
            }
        }
        for (let t = 0; t < this.activeArts.length; t++) {
            if (this.activeArts[t].growth >= 0) {
                this.activeArts[t].radius *= this.activeArts[t].growth
            }
            this.activeArts[t].move()
            this.activeArts[t].draw()
            this.activeArts[t].life--
        }
        for (let t = this.activeArts.length - 1; t >= 0; t--) {
            if (this.activeArts[t].life < 0) {
                this.activeArts.splice(t, 1)
            }
        }
    }
    reward() {
        if (this.rewardCap != 1) {
            this.rewardCap = 1
            if (this.type == -1) {
                return 50 + Math.floor(Math.random() * 11)
            } else {
                if(this.goldtotal > 0){
                    return 100 + Math.floor(Math.random() * 11) + Math.floor(this.goldtotal / 6)
                }else{
                    return 100
                }
            }
        }
        return 0
    }
    drawUI() {
        this.UI = [new Rectangle(400, 660, 60, 60, "#FF00FF"), new Rectangle(460, 660, 60, 60, "#FFff00"), new Rectangle(520, 660, 60, 60, "#00FFff"), new Rectangle(580, 660, 60, 60, "#FFFFFF")]

        canvas_context.fillStyle = "gold"
        canvas_context.font = "30px comic sans ms"
        canvas_context.fillText(this.gold, 20 - translator.x, 40 - translator.y)


        for (let t = 0; t < this.UI.length; t++) {
            this.UI[t].x -= translator.x
            this.UI[t].y -= translator.y
            if (this.cooldowns[t] > 0) {
                this.UI[t].draw()
                canvas_context.fillStyle = "black"
                canvas_context.font = "20px comic sans ms"
                canvas_context.fillText((1+Math.floor(this.cooldowns[t] / 60)), this.UI[t].x + 5, this.UI[t].y + 30)
            } else[
                this.UI[t].draw()
            ]
        }
    }
    move() {
        this.last = new Point(this.body.x, this.body.y)
        if (this.sleep == 1) {
            return
        }
        if (this.type == -1) {
            // this.goal = this.body
            let target = {}
            let min = 99999999
            let wet = 0
            for (let t = 0; t < players.length; t++) {
                if (players[t].team.top != this.team.top) {
                    let link = new LineOP(this.body, players[t].body)
                    let h = link.hypotenuse()
                    if (h < min) {
                        min = h
                        target = players[t]
                        wet = 1
                    }
                }
            }
            if (wet == 1) {
                this.goal = target.body
            } else {
                for (let t = 0; t < players.length; t++) {
                    if (players[t].type != -1 && players[t].team.top != this.team.top) {
                        let link = new LineOP(this.body, players[t].body)
                        let h = link.hypotenuse()
                        if (h < min) {
                            min = h
                            target = players[t]
                            wet = 1
                        }
                    }
                }
                if (wet == 1) {
                    this.goal = target.body
                } else {

                    for (let t = 0; t < teams.length; t++) {
                        if (teams[t].top != this.team.top) {
                            let link = new LineOP(this.body, teams[t].body)
                            let h = link.hypotenuse()
                            if (h < min) {
                                min = h
                                target = teams[t]
                                wet = 1
                            }
                        }
                    }
                    if (wet == 1) {
                        this.goal = target.body
                    }
                }
            }

        }
        if (this.rooted > 0) {
            this.rooted--
            this.body.x = this.root.x
            this.body.y = this.root.y
            this.goal = this.root
        } else if (this.goal) {
            if (this.goal == this.body) {

            } else {
                if (Math.abs(this.goal.x - this.body.x) + Math.abs(this.goal.y - this.body.y) > 16) {
                    for (let t = 0; t < ((this.speed + this.tempSpeed) * 2) * this.slowedByFloor; t++) {
                        let as = (new LineOP(this.goal, this.body)).angle()
                        this.body.x += Math.sign(this.goal.x - this.body.x) * .5 + ((Math.cos(as) / 5))
                        this.body.y += Math.sign(this.goal.y - this.body.y) * .5 + ((Math.sin(as) / 5))
                        if (this.selected == 1) {
                            let as = (new LineOP(this.goal, this.body)).angle()
                            canvas_context.translate(-((Math.sign(this.goal.x - this.body.x) * .5) + Math.cos(as) / 5), -((Math.sign(this.goal.y - this.body.y) * .5) + Math.sin(as) / 5))

                            translator.x -= (Math.sign(this.goal.x - this.body.x) * .5) + ((Math.cos(as) / 5))
                            translator.y -= (Math.sign(this.goal.y - this.body.y) * .5) + ((Math.sin(as) / 5))
                        }
                    }
                } else {
                    for (let t = 0; t < this.drops.length; t++) {
                        if (this.drops[t].dirLock > 0) {
                            this.drops.splice(t, 1)
                        }
                    }
                }
            }
            this.slowedByFloor = 1
        }
    }
    collide(player) {
        let j = 0
        while (this.body.doesPerimeterTouch(player.body)) {
            j++
            if (j > 100) {
                break
            }
            let li = new LineOP(this.body, player.body)
            let la = li.angle()
            this.body.x += Math.cos(la)
            this.body.y += Math.sin(la)
            player.body.x -= Math.cos(la)
            player.body.y -= Math.sin(la)
            if (player.body == players[0].body) {

                canvas_context.translate(Math.cos(la), Math.sin(la))
                translator.x += Math.cos(la)
                translator.y += Math.sin(la)
            }
            if (this.body == players[0].body) {

                canvas_context.translate(-Math.cos(la), -Math.sin(la))
                translator.x -= Math.cos(la)
                translator.y -= Math.sin(la)
            }

        }
        if (player.team.top == this.team.top) {
            return
        }
        for (let t = player.activeArts.length - 1; t >= 0; t--) {
            if (player.activeArts[t].doesPerimeterTouch) {
                if (player.activeArts[t].doesPerimeterTouch(this.body)) {
                    if (this.shield == 1) {
                        this.shield = 0
                        for (let k = this.activeArts.length - 1; k >= 0; k--) {
                            if (this.activeArts[k].knockShield == 1) {
                                this.activeArts.splice(k, 1)
                            }
                        }
                        if (player.activeArts[t].collide == 1) {
                            player.activeArts.splice(t, 1)
                        }
                        if (player.activeArts[t].grab == 1) {
                            player.activeArts[t].maxDis = player.activeArts[t].radius - 1
                            player.activeArts[t].grab = 0
                        }

                        continue
                    }
                    if (player.activeArts[t].line == 1) {
                    }
                    if (player.activeArts[t].grab == 1) {
                        player.activeArts[t].grab = 0
                        player.mana += player.maxmana / 8
                        this.rooted = player.activeArts[t].life
                        this.root = player.activeArts[t].k
                    }
                    if (player.activeArts[t].slow <= 1) {
                        this.slowedByFloor *= player.activeArts[t].slow
                    }
                    this.health -= player.activeArts[t].damage

                    if (this.health <= 0) {
                        player.gold += this.reward()
                        player.goldtotal += this.reward()
                    }

                    if (player.activeArts[t].emptyOut == 1) {
                        player.activeArts[t].damage = 0
                    }
                    if (player.activeArts[t].collide == 1) {
                        if (player.activeArts[t].pop == 1) {
                            let angle = 0
                            for (let p = 0; p < player.activeArts[t].poprays; p++) {
                                let ojb = new Circle(player.activeArts[t].x, player.activeArts[t].y, player.activeArts[t].popradius, player.activeArts[t].popcolor, Math.cos(angle) * player.activeArts[t].poprate, Math.sin(angle) * player.activeArts[t].poprate)
                                ojb.life = player.activeArts[t].poplife
                                ojb.damage = player.activeArts[t].popdam
                                ojb.collide = 1

                                angle += (Math.PI * 2) / player.activeArts[t].poprays
                                player.activeArts.push(ojb)
                            }
                        }
                        player.activeArts.splice(t, 1)
                    }
                }
            }
        }
    }
    draw() {
        // this.body.draw()
        // this.tick()
        // if(this.selected == 1){
        //     this.command()
        // }
        // this.fieldStuff()
        // this.artDraw()
        // if(this.selected == 1){
        // this.drawUI()
        // }
        // this.move()
    }
    meleehit() {
        if (this.type == -1) {
            let target = {}
            let min = 99999999
            let wet = 0
            for (let t = 0; t < players.length; t++) {
                if (players[t].team.top != this.team.top) {
                    let link = new LineOP(this.body, players[t].body)
                    let h = link.hypotenuse()
                    if (h < min && h < 70) {
                        min = h
                        target = players[t]
                        wet = 1
                    }
                }
            }
            if (wet == 1) {
                this.abilities[0](this, target)
            } else {

                for (let t = 0; t < players.length; t++) {
                    if (players[t].type != -1 && players[t].team.top != this.team.top) {
                        let link = new LineOP(this.body, players[t].body)
                        let h = link.hypotenuse()
                        if (h < min && h < 70) {
                            min = h
                            target = players[t]
                            wet = 1
                        }
                    }
                }
                if (wet == 1) {
                    this.abilities[0](this, target)
                } else {

                    for (let t = 0; t < teams.length; t++) {
                        if (teams[t].top != this.team.top) {
                            let link = new LineOP(this.body, teams[t].body)
                            let h = link.hypotenuse()
                            if (h < min && h < 70) {
                                min = h
                                target = teams[t]
                                wet = 1
                            }
                        }
                    }
                    if (wet == 1) {
                        this.abilities[0](this, target)
                    }
                }
            }
        }
    }
    meleehitChamp() {
        if (this.type != -1) {
            let target = {}
            let min = 99999999
            let wet = 0
            for (let t = 0; t < players.length; t++) {
                if (players[t].type != -1 && players[t].team.top != this.team.top) {
                    let link = new LineOP(this.body, players[t].body)
                    let h = link.hypotenuse()
                    if (h < min) {
                        min = h
                        target = players[t]
                        wet = 1
                    }
                }
            }
            if (wet == 1) {
                this.basicAttack(this, target)
            } else {

                for (let t = 0; t < players.length; t++) {
                    if (players[t].type == -1 && players[t].team.top != this.team.top) {
                        let link = new LineOP(this.body, players[t].body)
                        let h = link.hypotenuse()
                        if (h < min) {
                            min = h
                            target = players[t]
                            wet = 1
                        }
                    }
                }
                if (wet == 1) {
                    this.basicAttack(this, target)
                }
            }
        }
    }
    unitAI() {
        if (this.type == -1) {
            if (this.cooldowns[0] <= 0) {
                this.meleehit()
            }
        }
    }
    champBasic() {
        if (this.type != -1) {
            if (this.cooldowns[4] <= 0) {
                this.meleehitChamp()
            }
        }
    }
    command() {
        if (this.type == -1) {
            this.unitAI()
        } else {
            this.champBasic()
        }
        if (keysPressed['q'] && this.cooldowns[0] <= 0) {
            if (this.type == 0) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[0](this, this.body.x + (Math.cos(link.angle()) * -300), this.body.y + (Math.sin(link.angle()) * -300))
            }
            if (this.type == 1) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[0](this, this.body.x + (Math.cos(link.angle()) * -180), this.body.y + (Math.sin(link.angle()) * -180))
            }
            if (this.type == 2) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[0](this, this.body.x + (Math.cos(link.angle()) * 180), this.body.y + (Math.sin(link.angle()) * 180))
            }
            if (this.type == 3) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[0](this, this.body.x + (Math.cos(link.angle()) * 180), this.body.y + (Math.sin(link.angle()) * 180))
            }
        }
        if (keysPressed['w'] && this.cooldowns[1] <= 0) {
            if (this.type == 0) {
                this.abilities[1](this, this.body.x, this.body.y)
            }
            if (this.type == 1) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[1](this, this.body.x + (Math.cos(link.angle()) * -100), this.body.y + (Math.sin(link.angle()) * -100))
            }
            if (this.type == 2) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[1](this, this.body.x + (Math.cos(link.angle()) * -100), this.body.y + (Math.sin(link.angle()) * -100))
            }
            if (this.type == 3) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[1](this, this.body.x + (Math.cos(link.angle()) * -200), this.body.y + (Math.sin(link.angle()) * -200))
            }
        }
        if (keysPressed['e'] && this.cooldowns[2] <= 0) {
            if (this.type == 0) {
                this.abilities[2](this)
            }
            if (this.type == 1) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[2](this)
            }
            if (this.type == 2) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[2](this)
            }
            if (this.type == 3) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[2](this, this.body.x + (Math.cos(link.angle()) * -100), this.body.y + (Math.sin(link.angle()) * -100))
            }
        }
        if (keysPressed['r'] && this.cooldowns[3] <= 0) {
            if (this.type == 0) {
                this.abilities[3](this)
            }
            if (this.type == 1) {
                this.abilities[3](this)
            }
            if (this.type == 2) {
                this.abilities[3](this, this.body.x, this.body.y)
            }
            if (this.type == 3) {
                let link = new LineOP(this.body, TIP_engine)
                this.abilities[3](this, this.body.x + (Math.cos(link.angle()) * -100), this.body.y + (Math.sin(link.angle()) * -100))
            }
        }
    }
    artDraw() {
        if (this.type == -1) {
            if (this.team.top == 1) {
                canvas_context.drawImage(ie1, ((this.step % (ie1.width / 64)) * 64), 0, 64, 64, this.body.x - this.body.radius, this.body.y - this.body.radius, 2 * this.body.radius, 2 * this.body.radius)
            } else {
                canvas_context.drawImage(ie2, ((this.step % (ie2.width / 64)) * 64), 0, 64, 64, this.body.x - this.body.radius, this.body.y - this.body.radius, 2 * this.body.radius, 2 * this.body.radius)
            }
        }
        if (this.type == 0) {
            if (this.sleep == 1) {
                canvas_context.drawImage(i1, (20 * 64) + ((this.step % 4) * 64), 0, 64, 64, this.body.x - this.body.radius, this.body.y - this.body.radius, 2 * this.body.radius, 2 * this.body.radius)
            } else {
                canvas_context.drawImage(i1, ((this.step % 20) * 64), 0, 64, 64, this.body.x - this.body.radius, this.body.y - this.body.radius, 2 * this.body.radius, 2 * this.body.radius)
            }
        }
        if (this.type == 1) {
            canvas_context.drawImage(i2, ((this.step % (i2.width / 64)) * 64), 0, 64, 64, this.body.x - this.body.radius, this.body.y - this.body.radius, 2 * this.body.radius, 2 * this.body.radius)
        }
        if (this.type == 2) {
            canvas_context.drawImage(i3, ((this.step % (i3.width / 64)) * 64), 0, 64, 64, this.body.x - this.body.radius, this.body.y - this.body.radius, 2 * this.body.radius, 2 * this.body.radius)
        }
        if (this.type == 3) {
            canvas_context.drawImage(i4, ((this.step % (i4.width / 64)) * 64), 0, 64, 64, this.body.x - this.body.radius, this.body.y - this.body.radius, 2 * this.body.radius, 2 * this.body.radius)
        }

    }


    power4(type) {
        if (type == -1) {
            return this.unitmelee
        }
        if (type == 0) {
            return this.shielding
        }
        if (type == 1) {
            return this.sliming
        }
        if (type == 2) {
            return this.shockwaveP
        }
        if (type == 3) {
            return this.boombeam
        }
    }
    power3(type) {
        if (type == -1) {
            return this.unitmelee
        }
        if (type == 0) {
            return this.sleeping
        }
        if (type == 1) {
            return this.rushing
        }
        if (type == 2) {
            return this.rushing
        }
        if (type == 3) {
            return this.blastjump
        }
    }
    power2(type) {
        if (type == -1) {
            return this.unitmelee
        }
        if (type == 0) {
            return this.shockwave
        }
        if (type == 1) {
            return this.yspike
        }
        if (type == 2) {
            return this.tonguegrab
        }
        if (type == 3) {
            return this.bombfield
        }
    }
    power1(type) {
        if (type == -1) {
            return this.unitmelee
        }
        if (type == 0) {
            return this.psyblast
        }
        if (type == 1) {
            return this.slugmax
        }
        if (type == 2) {
            return this.eggspit
        }
        if (type == 3) {
            return this.bigbomb
        }
    }
    unitmeleeChamp(self, target) {
        let l = new LineOP(self.body, target.body)
        if (l.hypotenuse() < (this.meleeRange * 1.15)) {
            if (target.shield == 1) {
            } else {
                target.health -= 34
                if (target.health <= 0) {
                    self.gold += target.reward()
                    self.goldtotal += target.reward()
                }
            }
            self.cooldowns[4] = 30 * 1
            let manaCost = 0
            if (self.mana < manaCost) {
                return
            } else {
                self.mana -= manaCost
            }
            let lifeLength = 6
            let d = new MeleeSpike(self.body, this.meleeRange, (new LineOP(self.body, new Point(target.body.x, target.body.y)).angle()), "gray")
            d.echo = 1
            d.life = lifeLength
            d.line = 1
            d.growth = 1
            d.growth = 1.3
            d.root = self.body
            d.maxDis = 80
            d.damage = 0
            d.emptyOut = 1
            d.update = 1
            self.activeArts.push(d)
        }
    }
    unitmelee(self, target) {
        let l = new LineOP(self.body, target.body)
        if (l.hypotenuse() < 70) {
            if (target.shield == 1) {

            } else {
                target.health -= 10
                if (target.health <= 0) {
                    self.gold += target.reward()
                    self.goldtotal += target.reward()
                }
            }
            self.cooldowns[0] = 30 * 1
            let manaCost = 0
            if (self.mana < manaCost) {
                return
            } else {
                self.mana -= manaCost
            }
            let lifeLength = 6
            let d = new MeleeSpike(self.body, 64, (new LineOP(self.body, new Point(target.body.x, target.body.y)).angle()), "gray")
            d.echo = 1
            d.life = lifeLength
            d.line = 1
            d.growth = 1
            d.growth = 1.3
            d.root = self.body
            d.maxDis = 70
            d.damage = 0
            d.emptyOut = 1
            d.update = 1
            self.activeArts.push(d)
        }
    }
    boombeam(self, x, y) {

        let manaCost = 100
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }
        let lifeLength = 200
        let d = new BoomSpike(self.body, 30, (new LineOP(self.body, new Point(x, y)).angle()), "gray")
        d.echo = 1
        d.life = lifeLength
        d.line = 1
        d.moveAngle = 1
        d.growth = 1
        d.growth = 1.3
        d.root = self.body
        d.maxDis = 100
        d.damage = 2
        d.update = 1
        self.activeArts.push(d)
        self.cooldowns[3] = 40 * 10
    }
    bombfield(self, x, y) {


        let manaCost = 100
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }
        let lifeLength = 200
        let distance = 0
        let angle = (new LineOP(self.body, new Point(x, y)).angle())

        for (let t = 1; t < 20; t++) {
            let d = new Circle(x + (Math.cos(angle) * distance), y + (Math.sin(angle) * distance), 18, "#FFAA0088")
            d.echo = 1
            d.life = lifeLength
            d.growth = .99
            // d.root = TIP_engine
            d.maxDis = 3000
            d.update = 1
            d.slow = .9
            d.collide = 1
            d.damage = 5
            d.pop = 1
            d.popdam = 1
            d.poprays = 9
            d.poprate = 10
            d.popradius = 5
            d.popcolor = "yellow"
            d.poplife = 10
            // distance += 3-(t/30)
            angle += Math.PI / 2
            if (t % 5 == 0) {
                distance += 40
            }
            self.activeArts.push(d)
        }
        self.cooldowns[1] = 40 * 8
    }
    bigbomb(self, x, y) {
        let l = new LineOP(self.body, new Point(x, y))

        let manaCost = 100
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }
        let lifeLength = 65
        let shocher = new Circle(self.body.x, self.body.y, 35, "#888888", Math.cos(l.angle()) * 2 * 12, Math.sin(l.angle()) * 2 * 12)
        shocher.growth = .999
        // shocher.root = self.body
        shocher.life = lifeLength
        shocher.slow = .5
        shocher.collide = 1
        shocher.damage = 55
        shocher.update = 1
        shocher.pop = 1
        shocher.popdam = 5
        shocher.poprays = 9
        shocher.poprate = 10
        shocher.popradius = 5
        shocher.popcolor = "yellow"
        shocher.poplife = 10
        self.activeArts.push(shocher)
        self.cooldowns[0] = 40 * 4
    }
    eggspit(self, x, y) {
        let l = new LineOP(self.body, new Point(x, y))

        let manaCost = 60
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }
        let lifeLength = 65
        let shocher = new Circle(self.body.x, self.body.y, 25, "#ff00ff", Math.cos(l.angle()) * 2 * 16, Math.sin(l.angle()) * 2 * 16)
        shocher.growth = .999
        // shocher.root = self.body
        shocher.life = lifeLength
        shocher.slow = .5
        shocher.collide = 1
        shocher.damage = 75
        shocher.update = 1
        shocher.pop = 1
        shocher.popdam = 4
        shocher.poprays = 17
        shocher.poprate = 10
        shocher.popradius = 5
        shocher.popcolor = "yellow"
        shocher.poplife = 10
        self.activeArts.push(shocher)
        self.cooldowns[0] = 40 * 2
    }
    tonguegrab(self, x, y) {
        let manaCost = 70
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }
        let lifeLength = 30
        let d = new TongueSpike(self.body, 30, (new LineOP(self.body, new Point(x, y)).angle()), "blue", self)
        d.echo = 1
        d.life = lifeLength
        d.growth = 1
        d.growth = 1.15
        d.root = self.body
        d.grab = 1
        d.maxDis = 300
        d.damage = 7
        d.update = 1
        self.activeArts.push(d)
        self.cooldowns[1] = 40 * 3
    }
    slugmax(self, x, y) {

        let manaCost = 70
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }
        let lifeLength = 100
        let distance = 0
        let angle = (new LineOP(self.body, new Point(x, y)).angle())

        for (let t = 0; t < 60; t++) {
            let d = new Circle(x + (Math.cos(angle) * distance), y + (Math.sin(angle) * distance), 90 - (t / 1), "#AAFF0020")
            d.echo = 1
            d.life = lifeLength
            d.growth = .989
            // d.root = TIP_engine
            d.maxDis = 3000
            d.update = 1
            d.slow = .9
            d.damage = .1
            distance += 3 - (t / 30)
            angle += (Math.PI + (Math.PI / 60))
            self.activeArts.push(d)
        }
        self.cooldowns[0] = 40 * 10
    }
    dropSlime(self) {
        self.slimeTime++
        if (self.slimeTime % 4 == 0) {
            let manaCost = 5
            if (self.mana < manaCost) {
                return
            } else {
                self.mana -= manaCost
            }
            let lifeLength = 65
            let shocher = new Circle(self.body.x, self.body.y, 50, "#00ff0023")
            shocher.growth = .985
            // shocher.root = self.body
            shocher.life = lifeLength
            shocher.poison = 1
            shocher.damage = .5
            shocher.slow = .95
            shocher.update = 1
            self.activeArts.push(shocher)
        }
    }
    sliming(self) {

        self.slimeTime = 0
        self.slimeToggle *= -1
        self.cooldowns[3] = 40 * .5
    }

    blastjump(self) {
        let manaCost = 25
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }

        let speedBoost = 10
        self.tempSpeed += speedBoost
        self.boosts.push({ speedDown: 180, dropBy: speedBoost })
        // self.drops.push({ dirLock: 180 })
        self.health -= self.maxhealth * .1
        if (self.health <= 0) {
            self.health = 1
        }
        let lifeLength = 16
        let shocher = new Circle(self.body.x, self.body.y, 85, "#FFFF0033")
        shocher.growth = 1
        // shocher.root = self.body
        shocher.damage = 4
        shocher.life = lifeLength
        shocher.update = 1
        self.activeArts.push(shocher)
        let shocher2 = new Circle(self.body.x, self.body.y, 80, "#FF000022")
        shocher2.growth = 1
        // shocher2.root = self.body
        shocher2.damage = 2
        shocher2.life = lifeLength
        shocher2.update = 1
        self.activeArts.push(shocher2)
        self.cooldowns[2] = 40 * 5
    }

    rushing(self) {
        let manaCost = 25
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }

        let speedBoost = 3
        self.tempSpeed += speedBoost
        self.boosts.push({ speedDown: 180, dropBy: speedBoost })
        self.drops.push({ dirLock: 180 })
        self.cooldowns[2] = 40 * 5
    }
    sleeping(self) {
        let manaCost = 0
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }

        self.sleep *= -1
        if (self.sleep == 1) {
            self.health += (self.maxhealth / 10)
            if (self.health > self.maxhealth) {
                self.health = self.maxhealth
            }
        } else {
            self.mana += (self.maxmana / 10)
            if (self.mana > self.maxmana) {
                self.mana = self.maxmana
            }
        }
        self.cooldowns[2] = 40 * 2
    }
    shielding(self) {
        if (self.sleep == 1) {
            let manaCost = 100
            if (self.mana < manaCost) {
                return
            } else {
                self.mana -= manaCost
            }
            let lifeLength = 400
            for (let t = 0; t < players.length; t++) {
                if (players[t].team.top == self.team.top) {
                    players[t].shield = 1
                    let shocher = new Circle(players[t].body.x, players[t].body.y, 50, "#00FFFF44")
                    shocher.growth = 1
                    shocher.root = players[t].body
                    shocher.life = lifeLength
                    shocher.update = 1
                    shocher.knockShield = 1
                    players[t].activeArts.push(shocher)
                    shocher.damage = 0
                }
            }
            self.cooldowns[3] = 40 * 5
        } else {
            let manaCost = 100
            if (self.mana < manaCost) {
                return
            } else {
                self.mana -= manaCost
            }
            let lifeLength = 300
            for (let t = 0; t < players.length; t++) {
                if (players[t].team.top == self.team.top) {
                    players[t].shield = 1
                    let shocher = new Circle(players[t].body.x, players[t].body.y, 50, "#00FFFF44")
                    shocher.growth = 1
                    shocher.root = players[t].body
                    shocher.life = lifeLength
                    shocher.update = 1
                    shocher.knockShield = 1
                    players[t].activeArts.push(shocher)
                    shocher.damage = 0
                }
            }
            self.cooldowns[3] = 40 * 3
        }
    }
    shockwave(self, x, y) {
        if (self.sleep == 1) {
            let manaCost = 60
            if (self.mana < manaCost) {
                return
            } else {
                self.mana -= manaCost
            }
            let lifeLength = 16
            let shocher = new Circle(self.body.x, self.body.y, 85, "#FF000033")
            shocher.growth = 1
            shocher.root = self.body
            shocher.damage = 2
            shocher.life = lifeLength
            shocher.update = 1
            self.activeArts.push(shocher)
            let shocher2 = new Circle(self.body.x, self.body.y, 80, "#FFffFF22")
            shocher2.growth = 1
            shocher2.root = self.body
            shocher2.damage = 2
            shocher2.life = lifeLength
            shocher2.update = 1
            self.activeArts.push(shocher2)
            self.cooldowns[1] = 40 * 6
        } else {
            let manaCost = 60
            if (self.mana < manaCost) {
                return
            } else {
                self.mana -= manaCost
            }
            let lifeLength = 30
            let shocher = new Circle(self.body.x, self.body.y, 35, "#00ff0033")
            shocher.growth = 1.055
            shocher.root = self.body
            shocher.life = lifeLength
            shocher.update = 1
            shocher.damage = 2.5
            self.activeArts.push(shocher)
            let shocher2 = new Circle(self.body.x, self.body.y, 28, "#FFffFF22")
            shocher2.growth = 1.055
            shocher2.root = self.body
            shocher2.life = lifeLength
            shocher2.damage = 2.5
            shocher2.update = 1
            self.activeArts.push(shocher2)
            self.cooldowns[1] = 40 * 6
        }
    }
    shockwaveP(self, x, y) {
        let manaCost = 40
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }
        let lifeLength = 9
        let shocher = new Circle(self.body.x, self.body.y, 35, "#00ffff40")
        shocher.growth = 1.17
        shocher.root = self.body
        shocher.life = lifeLength
        shocher.update = 1
        shocher.damage = 20
        shocher.slow = .05
        self.activeArts.push(shocher)
        self.cooldowns[3] = 40 * 1
    }

    psyblast(self, x, y) {
        if (self.sleep == 1) {
            let manaCost = 130
            if (self.mana < manaCost) {
                return
            } else {
                self.mana -= manaCost
            }
            let lifeLength = 60
            let dx = new Circle(self.body.x, self.body.y, 150, "#FF00FF88")
            dx.life = lifeLength
            dx.update = 1
            dx.growth = 1
            dx.damage = 30
            dx.root = self.body
            self.activeArts.push(dx)
            self.cooldowns[0] = 40 * 10
        } else {
            let manaCost = 130
            if (self.mana < manaCost) {
                return
            } else {
                self.mana -= manaCost
            }
            let lifeLength = 100
            let d = new Circle(x, y, 10, "magenta")
            d.echo = 1
            d.life = lifeLength
            d.growth = 1
            d.root = TIP_engine
            d.maxDis = 300
            d.damage = 3
            d.update = 1
            self.activeArts.push(d)
            let p = new LineOP(self.body, d, "magenta", 16)
            p.echo = 1
            p.growth = 1
            p.life = lifeLength
            p.update = 1
            p.damage = 3
            self.activeArts.push(p)
            let dx = new Circle(self.body.x, self.body.y, 10, "magenta")
            dx.echo = 1
            dx.life = lifeLength
            dx.update = 1
            dx.root = self.body
            dx.damage = 3
            dx.growth = 1
            self.activeArts.push(dx)
            let dxi = new Circle(self.body.x, self.body.y, 7, "white")
            dxi.echo = 1
            dxi.life = lifeLength
            dxi.update = 1
            dxi.root = self.body
            dxi.damage = 3
            dxi.growth = 1
            self.activeArts.push(dxi)
            let di = new Circle(x, y, 7, "white")
            di.echo = 1
            di.life = lifeLength
            di.update = 1
            di.root = TIP_engine
            di.maxDis = 300
            di.damage = 3
            di.growth = 1
            self.activeArts.push(di)
            let i = new LineOP(self.body, d, "white", 10)
            i.echo = 1
            i.life = lifeLength
            i.update = 1
            i.growth = 1
            i.damage = 3
            self.activeArts.push(i)
            self.cooldowns[0] = 40 * 10
        }
    }
    yspike(self, x, y) {

        let manaCost = 45
        if (self.mana < manaCost) {
            return
        } else {
            self.mana -= manaCost
        }
        let lifeLength = 90
        let d = new YSpike(self.body, 30, (new LineOP(self.body, new Point(x, y)).angle()), "gray")
        d.echo = 1
        d.life = lifeLength
        d.line = 1
        d.growth = 1
        d.growth = 1.25
        d.root = self.body
        d.maxDis = 150
        d.damage = 3
        d.update = 1
        self.activeArts.push(d)
        self.cooldowns[1] = 40 * 10
    }

}


let i1 = new Image()
i1.src = "r2.png"
let i2 = new Image()
i2.src = "r23.png"
let i3 = new Image()
i3.src = "r12.png"
let i4 = new Image()
i4.src = "r27.png"
let ie1 = new Image()
ie1.src = "c51.png"
let ie2 = new Image()
ie2.src = "c51b.png"
let characters = []
function genericReward() {
    return 50
}

let topTeam = { bot: 0, top: 1, players: [], body: new Circle(720 * 2, 720 * 2, 20, "blue") }
let botTeam = { bot: 1, top: 0, players: [], body: new Circle(720 * 5.5, 720 * 5.5, 20, "red") }
topTeam.health = 100
botTeam.health = 100
botTeam.reward = genericReward
topTeam.maxhealth = topTeam.health
botTeam.maxhealth = botTeam.health
topTeam.reward = genericReward

let teams = [topTeam, botTeam]
let sluggernaut = new Champ(1, topTeam)
let psybean = new Champ(0, topTeam)
let pomao = new Champ(2, topTeam)
let missileaneous = new Champ(3, topTeam)
let guy = new Champ(-1, topTeam)
let guy2 = new Champ(-1, botTeam)
guy2.body.x = 1920 * 2
guy2.body.y = 1970 * 2
let players = [missileaneous, guy, guy2]
let walls = []
let xWallRight1 = new WallSpike(new Point(1358, 858), 205, 0, "red")
let xWallLeft1 = new WallSpike(new Point(1358, 858), 205, Math.PI, "red")
walls.push(xWallRight1)
walls.push(xWallLeft1)
let xWallRight2 = new WallSpike(new Point(816, 1340), 205, 0, "red")
let xWallLeft2 = new WallSpike(new Point(816, 1340), 205, Math.PI, "red")
walls.push(xWallRight2)
walls.push(xWallLeft2)
let xWallRight3 = new WallSpike(new Point(1832, 1388), 205, 0, "red")
let xWallLeft3 = new WallSpike(new Point(1832, 1388), 205, Math.PI, "red")
walls.push(xWallRight3)
walls.push(xWallLeft3)
let xWallRight4 = new WallSpike(new Point(1288, 1872), 205, 0, "red")
let xWallLeft4 = new WallSpike(new Point(1288, 1872), 205, Math.PI, "red")
walls.push(xWallRight4)
walls.push(xWallLeft4)
let zWallTop1 = new WallSpike(new Point(1372, 348), 205 * 1.75, Math.PI + (Math.PI * .5), "red")
walls.push(zWallTop1)
let zWallTop2 = new WallSpike(new Point(1884, 384), 205 * 1.75, Math.PI + (Math.PI * .5), "red")
walls.push(zWallTop2)
let zWallTop3 = new WallSpike(new Point(874, 332), 205 * 1.75, Math.PI + (Math.PI * .5), "red")
walls.push(zWallTop3)


let yWallBottom1 = new WallSpike(new Point(337, 800), 205 * 1.75, Math.PI + .075, "red")
walls.push(yWallBottom1)
let yWallBottom2 = new WallSpike(new Point(306, 1308), 205 * 1.75, Math.PI + .075, "red")
walls.push(yWallBottom2)
let yWallBottom3 = new WallSpike(new Point(288, 1812), 205 * 1.75, Math.PI + .075, "red")
walls.push(yWallBottom3)



let wWallRight1 = new WallSpike(new Point(2364, 908), 200 * 1.75, 0 + .075, "red")
walls.push(wWallRight1)
let wWallRight2 = new WallSpike(new Point(2344, 1422), 200 * 1.75, 0 + .075, "red")
walls.push(wWallRight2)
let wWallRight3 = new WallSpike(new Point(2304, 1938), 200 * 1.75, 0 + .075, "red")
walls.push(wWallRight3)


let qWallRight1 = new WallSpike(new Point(760, 2350), 200 * 1.75, Math.PI - (Math.PI * .5) + .075, "red")
walls.push(qWallRight1)
let qWallRight2 = new WallSpike(new Point(1270, 2370), 200 * 1.75, Math.PI - (Math.PI * .5) + .075, "red")
walls.push(qWallRight2)
let qWallRight3 = new WallSpike(new Point(1770, 2410), 200 * 1.75, Math.PI - (Math.PI * .5) + .075, "red")
walls.push(qWallRight3)

for (let t = 0; t < walls.length; t++) {
    walls[t].track.x *= 2
    walls[t].track.y *= 2
    walls[t].radius *= 2
}

let wodmap = new Image()
wodmap.src = "wodmap3.png"
let wodmapz = new Image()
wodmapz.src = "wodmapz.png"
let time = 0


function main() {
    canvas_context.clearRect(-1000, -1000, canvas.width * 10, canvas.height * 10)  // refreshes the image
    canvas_context.drawImage(wodmap, 0, 0)
    botTeam.body.draw()
    topTeam.body.draw()


    if (topTeam.health < 0) {
        topTeam.health = 0
    }
    if (topTeam.health > topTeam.maxhealth) {
        topTeam.health = topTeam.maxhealth
    }
    topTeam.healthBar = new Rectangle(topTeam.body.x - 32, topTeam.body.y - 42, 64 * (topTeam.health / topTeam.maxhealth), 7, "#00ff00")
    topTeam.healthBarBack = new Rectangle(topTeam.body.x - 32, topTeam.body.y - 42, 64, 7, "#000000")
    topTeam.healthBarOut = new Rectangle(topTeam.body.x - 34, topTeam.body.y - 44, 68, 11, "#FFFFFF")
    topTeam.healthBarOut.draw()
    topTeam.healthBarBack.draw()
    topTeam.healthBar.draw()


    if (botTeam.health < 0) {
        botTeam.health = 0
    }
    if (botTeam.health > botTeam.maxhealth) {
        botTeam.health = botTeam.maxhealth
    }
    botTeam.healthBar = new Rectangle(botTeam.body.x - 32, botTeam.body.y - 42, 64 * (botTeam.health / botTeam.maxhealth), 7, "#00ff00")
    botTeam.healthBarBack = new Rectangle(botTeam.body.x - 32, botTeam.body.y - 42, 64, 7, "#000000")
    botTeam.healthBarOut = new Rectangle(botTeam.body.x - 34, botTeam.body.y - 44, 68, 11, "#FFFFFF")
    botTeam.healthBarOut.draw()
    botTeam.healthBarBack.draw()
    botTeam.healthBar.draw()


    // gamepadAPI.update() //checks for button presses/stick movement on the connected controller)
    // game code goes here
    // psybean.draw()
    time++
    if (time > 1) {
        if (time % 500 == 0) {
            for (let k = 0; k < 3; k++) {

                let guyz = new Champ(-1, topTeam)
                let guy2z = new Champ(-1, botTeam)
                guy2z.body.x = 1920 * 2
                guy2z.body.y = 1970 * 2
                guy2z.body.x += k
                guyz.body.x += k
                players.push(guyz)
                players.push(guy2z)
            }
        }
    }

    players[0].selected = 1

    // sluggernaut.draw()


    for (let t = 0; t < players.length; t++) {
        players[t].tick()
    }
    for (let t = 0; t < players.length; t++) {
        if (players[t].selected == 1 || players[t].type == -1) {
            players[t].command()
        }
    }
    for (let t = 0; t < players.length; t++) {
        players[t].fieldStuff()
    }
    for (let t = 0; t < players.length; t++) {
        players[t].artDraw()
    }
    // for (let k = 0; k < walls.length; k++) {
    //     walls[k].draw()
    // }
    for (let t = 0; t < players.length; t++) {
        players[t].healthDraw()
    }
    for (let t = 0; t < players.length; t++) {
        if (players[t].selected == 1) {
            players[t].drawUI()
        }
    }
    for (let t = 0; t < players.length; t++) {
        for (let k = 0; k < walls.length; k++) {
            walls[k].doesPerimeterTouch(players[t].body)


            for (let w = 0; w < players[t].activeArts.length; w++) {
                if (players[t].activeArts[w].collide == 1) {
                    if (!walls[k].doesPerimeterTouch(players[t].activeArts[w])) {
                        continue
                    }
                    if (players[t].activeArts[w].pop == 1) {
                        let angle = 0
                        for (let p = 0; p < players[t].activeArts[w].poprays; p++) {
                            let ojb = new Circle(players[t].activeArts[w].x, players[t].activeArts[w].y, players[t].activeArts[w].popradius, players[t].activeArts[w].popcolor, Math.cos(angle) * players[t].activeArts[w].poprate, Math.sin(angle) * players[t].activeArts[w].poprate)
                            ojb.life = players[t].activeArts[w].poplife
                            ojb.damage = players[t].activeArts[w].popdam
                            ojb.collide = 1

                            angle += (Math.PI * 2) / players[t].activeArts[w].poprays
                            players[t].activeArts.push(ojb)
                        }
                    }
                    players[t].activeArts.splice(t, 1)
                }

            }


        }


        players[t].move()
        for (let k = 0; k < walls.length; k++) {
            // walls[k].draw()
            walls[k].doesPerimeterTouch(players[t].body)
        }
    }
    for (let t = 0; t < players.length; t++) {
        for (let k = 0; k < players.length; k++) {
            if (t != k) {
                players[t].collide(players[k])
            }
        }
    }
    for (let t = 0; t < players.length; t++) {
        if (players[t].health <= 0) {
            if (players[t].type == -1) {
                players.splice(t, 1)
            } else {
                // players[t] = new Champ(Math.floor(Math.random() * 4), { players: [] })

                keysPressed[' '] = true
                // players.splice(1,t)
            }
        }
    }
    if (keysPressed[' ']) {
        keysPressed[' '] = false
        canvas_context.resetTransform()
        canvas_context.translate(-360 - (1280 - (640 - 360)), -360 - 720)
        translator.x = 0
        translator.y = 0
        translator.x += -360 - (1280 - (640 - 360))
        translator.y += -360 - 720
        for (let t = 0; t < players.length; t++) {
            // if(players[t].health <=0){
            if (players[t].type == -1) {
                // players[t].health = players[t].maxhealth
                // players[t].body.x = 0
                // players[t].body.y = 0
                players.splice(1, t)
            } else {
                players[t] = new Champ((players[t].type + 1) % 4, topTeam)
                // players.splice(1,t)
            }
            // }
        }
    }

    // this.tick()
    // if(this.selected == 1){
    //     this.command()
    // }
    // this.fieldStuff()
    // this.artDraw()
    // if(this.selected == 1){
    // this.drawUI()
    // }
    // this.move()

    canvas_context.drawImage(wodmapz, (1280 - 270) - translator.x, (720 - 270) - translator.y)
    for (let t = 0; t < players.length; t++) {
        if (t == 0) {
            let dot = new Circle(players[t].body.x * .05, players[t].body.y * .05, 3, "yellow")
            if (players[t].type == -1) {
                dot.radius = 1.5
            }
            dot.x += (1280 - 270) - translator.x
            dot.y += (720 - 270) - translator.y
            dot.draw()
        } else if (players[t].team.top == 1) {
            let dot = new Circle(players[t].body.x * .05, players[t].body.y * .05, 3, "blue")
            if (players[t].type == -1) {
                dot.radius = 1.5
            }
            dot.x += (1280 - 270) - translator.x
            dot.y += (720 - 270) - translator.y
            dot.draw()
        } else {
            let dot = new Circle(players[t].body.x * .05, players[t].body.y * .05, 3, "red")
            if (players[t].type == -1) {
                dot.radius = 1.5
            }
            dot.x += (1280 - 270) - translator.x
            dot.y += (720 - 270) - translator.y
            dot.draw()
        }
    }


}

// })

