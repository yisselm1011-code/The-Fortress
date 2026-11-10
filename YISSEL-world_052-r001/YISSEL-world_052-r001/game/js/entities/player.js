// TEACHER-OWNED: player movement (top-down on the hub/home, side-view in platformers).
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 28;
    this.speed = 2.5;
    this.facing = "down";
    this.state = "idle";
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpCount = 0;
  }

  updatePlatformer(level) {
    const moveSpeed = 4;
    const jumpForce = -11;
    const gravity = 0.55;
    const maxFall = 14;
    const solids = level.solids || [];
    const hazards = level.hazards || [];

    this.vx = 0;
    if (isMoveLeft()) {
      this.vx = -moveSpeed;
      this.facing = "left";
    } else if (isMoveRight()) {
      this.vx = moveSpeed;
      this.facing = "right";
    }

    this.onGround = isOnGround(this, solids);
    const canDoubleJump = typeof hasReward === "function" && hasReward("double_jump");

    if (input.isPressed("Space") || input.isPressed("ArrowUp") || input.isPressed("KeyW")) {
      if (this.onGround) {
        this.vy = jumpForce;
        this.jumpCount = 1;
      } else if (canDoubleJump && this.jumpCount < 2) {
        this.vy = jumpForce;
        this.jumpCount = 2;
      }
    }

    applyGravity(this, gravity, maxFall);
    moveWithCollision(this, this.vx, 0, solids);
    moveWithCollision(this, 0, this.vy, solids);
    this.onGround = isOnGround(this, solids);
    if (this.onGround && this.vy > 0) {
      this.vy = 0;
    }

    for (let i = 0; i < hazards.length; i++) {
      if (isColliding(this, hazards[i])) {
        // Tell the scene to reset the WHOLE attempt, including collected keys.
        return true;
      }
    }

    this.state = this.vx !== 0 || this.vy !== 0 ? "walk" : "idle";
    // Falling out of a level is a failure, not an endless fall.
    return this.y > (level.height || 640) || this.x + this.width < 0 || this.x > (level.width || 960);
  }

  updateTopDown(collisionObjects, movementBlocked) {
    if (movementBlocked) {
      this.state = "idle";
      return;
    }

    let dx = 0;
    let dy = 0;

    // Vertical input wins so the player cannot move diagonally in Version 1.
    if (isMoveUp()) {
      dy = -this.speed;
      this.facing = "up";
    } else if (isMoveDown()) {
      dy = this.speed;
      this.facing = "down";
    } else if (isMoveLeft()) {
      dx = -this.speed;
      this.facing = "left";
    } else if (isMoveRight()) {
      dx = this.speed;
      this.facing = "right";
    }

    if (dx !== 0 || dy !== 0) {
      this.state = "walk";
      moveWithCollision(this, dx, dy, collisionObjects);
    } else {
      this.state = "idle";
    }
  }

  draw(ctx, camera) {
    const camX = camera ? camera.x : 0;
    const camY = camera ? camera.y : 0;
    const screenX = this.x - camX;
    const screenY = this.y - camY;

    ctx.fillStyle = "#3a7bd5";
    ctx.fillRect(screenX, screenY, this.width, this.height);

    ctx.fillStyle = "#cce5ff";
    const indicatorSize = 8;
    let indicatorX = screenX + (this.width - indicatorSize) / 2;
    let indicatorY = screenY + (this.height - indicatorSize) / 2;

    if (this.facing === "up") {
      indicatorY = screenY;
    } else if (this.facing === "down") {
      indicatorY = screenY + this.height - indicatorSize;
    } else if (this.facing === "left") {
      indicatorX = screenX;
    } else if (this.facing === "right") {
      indicatorX = screenX + this.width - indicatorSize;
    }

    ctx.fillRect(indicatorX, indicatorY, indicatorSize, indicatorSize);
  }
}
