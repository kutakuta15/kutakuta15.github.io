(() => {
    const content = document.getElementById("content");
    const canvas = document.getElementById("game-canvas");
    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext("2d");
    const aspect = canvas.width / canvas.height;

    const styles = {
        background: "#001014",
        player: [
            [0.0, "#107dc8"],
            [0.7, "#073858"],
            [1.0, "#253449"]
        ],
        ball: [
            [0.0, "#fff"],
            [1.0, "#555"]
        ]
    };

    window.addEventListener("resize", () => {
        const availableWidth = content.clientWidth;
        const displayWidth = availableWidth;
        const displayHeight = displayWidth / aspect;
        canvas.style.width = displayWidth + "px";
        canvas.style.height = displayHeight + "px";
    });
    window.dispatchEvent(new Event("resize"));

    class Time {
        constructor(maxFps = 60) {
            this.maxFps = maxFps;
            this.startTime = undefined;
            this.elapsedTime = 0;
            this.timePerFrame = this.maxFps > 0 ? 1000 / this.maxFps : 0;

            this.fps = 0;
            this.fpsList = [];
        }
        calcFps(timeStamp) {
            if (this.startTime === undefined) {
                this.startTime = timeStamp;
                return true;
            }

            let diffTime = timeStamp - this.startTime;
            if (this.maxFps <= 0) {
                this.fpsList.push(timeStamp);
                while (this.fpsList[this.fpsList.length - 1] - this.fpsList[0] > 1000) this.fpsList.shift();
                texts.fps.textContent = this.fpsList.length;

                this.startTime = timeStamp;
                return true;
            }

            this.elapsedTime = diffTime;

            if (this.elapsedTime < this.timePerFrame) { return false; }
            else {
                this.elapsedTime -= this.timePerFrame;

                this.fpsList.push(timeStamp);
                while (this.fpsList[this.fpsList.length - 1] - this.fpsList[0] > 1000) this.fpsList.shift();
                texts.fps.textContent = this.fpsList.length;

                this.startTime = timeStamp - this.elapsedTime;
                return true;
            }
        }
    }

    class Brick {
        constructor(position = { x: 0, y: 0 }, extents = { x: 60, y: 20 }, colors = [[0.0, "#fab"], [1.0, "#f25ffb"]]) {
            this.position = position;
            this.extents = extents;
            this.colors = colors;
        }
        draw() {
            const { position, extents, colors } = this;

            let gradient = ctx.createLinearGradient(
                0, this.position.y - this.extents.y,
                0, this.position.y + this.extents.y
            );
            for (let [offset, color] of colors) {
                gradient.addColorStop(offset, color);
            }

            ctx.fillStyle = gradient;
            ctx.strokeStyle = gradient;

            ctx.beginPath();
            ctx.lineTo(position.x - extents.x, position.y + extents.y, position.x + extents.x, position.y + extents.y);
            ctx.lineTo(position.x + extents.x, position.y + extents.y, position.x + extents.x, position.y - extents.y);
            ctx.lineTo(position.x + extents.x, position.y - extents.y, position.x - extents.x, position.y - extents.y);
            ctx.lineTo(position.x - extents.x, position.y - extents.y, position.x - extents.x, position.y + extents.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    class Breakbricks {
        constructor() {
            this.score = 0;
            this.queueCount = 0;
            this.bricks = new Array();

            this.player = {
                position: { x: 960, y: 900 },
                size: { width: 240, height: 45 },
                draw: () => {
                    const { position, size } = this.player;

                    // style
                    let gradient = ctx.createLinearGradient(
                        0, position.y - size.height,
                        0, position.y + size.height
                    );
                    for (let [offset, col] of styles.player) {
                        gradient.addColorStop(offset, col);
                    }
                    ctx.fillStyle = gradient;
                    ctx.strokeStyle = gradient;

                    // draw
                    ctx.beginPath();
                    ctx.arc(position.x - size.width / 2 + size.height / 2, position.y, size.height / 2, Math.PI * 3 / 2, Math.PI / 2, true);
                    ctx.lineTo(position.x + size.width / 2 - size.height / 2, position.y + size.height / 2);
                    ctx.arc(position.x + size.width / 2 - size.height / 2, position.y, size.height / 2, Math.PI / 2, Math.PI * 3 / 2, true);
                    ctx.lineTo(position.x - size.width / 2 + size.height / 2, position.y - size.height / 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            };

            this.ball = {
                position: { x: 960, y: 860 },
                radius: 20,

                velocity: { x: 0, y: 0 },
                speed: 8,

                update: () => {
                    const { position, velocity, radius } = this.ball;
                    let nextPos = {
                        x: position.x + velocity.x,
                        y: position.y + velocity.y
                    };

                    // スクリーン枠判定
                    if (nextPos.x < radius / 2) {
                        let over = radius / 2 - nextPos.x;
                        nextPos.x = radius / 2 + over;
                        velocity.x *= -1;
                    } else if (nextPos.x > canvas.width - radius / 2) {
                        let over = (canvas.width - radius / 2) - nextPos.x;
                        nextPos.x = (canvas.width - radius / 2) + over;
                        velocity.x *= -1;
                    }

                    if (nextPos.y < radius / 2) {
                        let over = radius / 2 - nextPos.y;
                        nextPos.y = radius / 2 + over;
                        velocity.y *= -1;
                    } else if (nextPos.y > canvas.height + radius / 2) {
                        // ゲームオーバー
                        //(仮反射)

                        let over = (canvas.height + radius / 2) - nextPos.y;
                        nextPos.y = (canvas.height + radius / 2) + over;
                        velocity.y *= -1;

                    }

                    // プレイヤー判定
                    const { position: pPos, size: pSize } = this.player;
                    let r = pSize.height / 2;

                    let ax = pPos.x - pSize.width / 2;
                    let t = clamp((nextPos.x - ax) / pSize.width, 0, 1);

                    let px = ax + pSize.width * t;
                    let dx = nextPos.x - px;
                    let dy = nextPos.y - pPos.y;

                    let rr = r + radius;
                    if (dx * dx + dy * dy <= rr ** 2) {
                        const invLen = 1 / Math.hypot(dx, dy);
                        const nx = dx * invLen;
                        const ny = dy * invLen;

                        nextPos.x = px + nx * rr;
                        nextPos.y = pPos.y + ny * rr;

                        let dot = velocity.x * nx + velocity.y * ny;
                        this.ball.velocity.x -= 2 * dot * nx;
                        this.ball.velocity.y -= 2 * dot * ny;
                    }

                    this.ball.position = nextPos;
                },
                draw: () => {
                    const { position, radius } = this.ball;

                    // style
                    let gradient = ctx.createLinearGradient(
                        position.x - radius / 2, position.y - radius / 2,
                        position.x + radius
                        / 2, position.y + radius / 2
                    );
                    for (let [offset, col] of styles.ball) {
                        gradient.addColorStop(offset, col);
                    }
                    ctx.fillStyle = gradient;
                    ctx.strokeStyle = gradient;

                    // draw
                    ctx.beginPath();
                    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            };

            this.generateBricks();
        }
        update() {
            this.ball.update();

            if (this.ball.velocity.x !== 0 || this.ball.velocity.y !== 0) {
                brickCollision(this.ball, this.bricks);
            }
        }
        draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = styles.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let brick of this.bricks) { brick.draw(); }
            this.player.draw();
            this.ball.draw();
        }
        generateBricks() {
            // 一旦仮定数
            let mx = 2;
            let my = 3;
            for (let ix = 0; ix < mx; ix++) {
                for (let iy = 0; iy < my; iy++) {
                    const brick = new Brick();
                    let { position, extents } = brick;

                    let cx = canvas.width / 2,
                        cy = canvas.height / 2;

                    position.x = cx - (mx - 1) * extents.x + ix * extents.x * 2;
                    position.y = cy - (my - 1) * extents.y + iy * extents.y * 2;
                    this.bricks.push(brick);
                }
            }
        }
    }

    const time = new Time(60);
    const breakbricks = new Breakbricks();

    const texts = {
        fps: document.getElementById("fps")
    };

    //==========================
    // メインループ
    //==========================

    function main(timeStamp) {
        if (!time.calcFps(timeStamp)) {
            window.requestAnimationFrame(main);
            return;
        }

        breakbricks.update();
        breakbricks.draw();
        window.requestAnimationFrame(main);
    }

    window.requestAnimationFrame(main);

    canvas.addEventListener('touchstart', (e) => {
        const { ball } = breakbricks;
        if (e.touches.length === 1 && ball.velocity.x === 0 && ball.velocity.y === 0) {
            // ボールに初期値を与える〜
            let angle = (Math.random() * 160 - 80) * (Math.PI / 180);
            ball.velocity.x = ball.speed * Math.sin(angle);
            ball.velocity.y = ball.speed * -Math.cos(angle);
        }
        e.preventDefault();
    });

    canvas.addEventListener('touchmove', (e) => {
        const { player, ball } = breakbricks;
        const halfWidth = player.size.width / 2 + player.size.height / 2;
        for (let t of e.changedTouches) {
            const rect = canvas.getBoundingClientRect();
            const tx = (t.clientX - rect.left) * (canvas.width / rect.width);
            player.position.x = clamp(tx, halfWidth, canvas.width - halfWidth);
            if (ball.velocity.x === 0 && ball.velocity.y === 0) {
                ball.position.x = clamp(tx, halfWidth, canvas.width - halfWidth);
            }
        }
        e.preventDefault();
    });

    canvas.addEventListener('click', (e) => {
        const { ball } = breakbricks;
        if (e.detail === 1 && ball.velocity.x === 0 && ball.velocity.y === 0) {
            // ボールに初期値を与える〜
            let angle = (Math.random() * 160 - 80) * (Math.PI / 180);
            ball.velocity.x = ball.speed * Math.sin(angle);
            ball.velocity.y = ball.speed * -Math.cos(angle);
        }
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        const { player, ball } = breakbricks;
        const halfWidth = player.size.width / 2 + player.size.height / 2;
        const rect = canvas.getBoundingClientRect();
        const tx = (e.clientX - rect.left) * (canvas.width / rect.width);
        player.position.x = clamp(tx, halfWidth, canvas.width - halfWidth);
        if (ball.velocity.x === 0 && ball.velocity.y === 0) {
            ball.position.x = clamp(tx, halfWidth, canvas.width - halfWidth);
        }
        e.preventDefault();
    });

    function brickCollision(ball, bricks) {
        const { position: { x, y }, velocity: { x: vx, y: vy }, radius: r } = ball;
        let closest = null;
        for (let brick of bricks) {
            const { position: { x: px, y: py }, extents: { x: ex, y: ey } } = brick;
            let cp = {
                x: clamp(x, px - ex, px + ex),
                y: clamp(y, py - ey, py + ey)
            };

            let dx = x - cp.x;
            let dy = y - cp.y;
            let distSq = dx ** 2 + dy ** 2;

            if (distSq <= r ** 2) {
                let dist = Math.sqrt(distSq) || 0.0001;
                let nx = dx / dist;
                let ny = dy / dist;
                let overlap = r - dist;

                if (!closest || overlap > closest.overlap) {
                    closest = { nx, ny, overlap };
                }
            }
        }

        if (!closest) { return; }

        let dot = vx * closest.nx + vy * closest.ny;
        ball.velocity.x = vx - 2 * dot * closest.nx;
        ball.velocity.y = vy - 2 * dot * closest.ny;

        ball.position.x += closest.nx * closest.overlap;
        ball.position.y += closest.ny * closest.overlap;
    }
})();