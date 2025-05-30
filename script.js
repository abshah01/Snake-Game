const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scale = 20;
const rows = canvas.height / scale;
const cols = canvas.width / scale;

let snake;
let food;
let snakeHeadImg = null;

class Snake {
  constructor() {
    this.body = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.length = 1;
  }

  draw() {
    // Draw body segments as green squares
    ctx.fillStyle = 'lime';
    for (let i = 1; i < this.body.length; i++) {
      let part = this.body[i];
      ctx.fillRect(part.x * scale, part.y * scale, scale, scale);
    }

    // Draw head as image if loaded, else green square
    let head = this.body[0];
    if (snakeHeadImg) {
      ctx.save();
      // Move origin to the head position center
      ctx.translate(head.x * scale + scale / 2, head.y * scale + scale / 2);

      // Rotate image based on direction
      let angle = 0;
      if (this.xSpeed === 1) angle = 0;
      else if (this.xSpeed === -1) angle = Math.PI;
      else if (this.ySpeed === 1) angle = Math.PI / 2;
      else if (this.ySpeed === -1) angle = -Math.PI / 2;

      ctx.rotate(angle);
      ctx.drawImage(snakeHeadImg, -scale / 2, -scale / 2, scale, scale);
      ctx.restore();
    } else {
      ctx.fillStyle = 'lime';
      ctx.fillRect(head.x * scale, head.y * scale, scale, scale);
    }
  }

  update() {
    let head = { x: this.body[0].x + this.xSpeed, y: this.body[0].y + this.ySpeed };

    // Wrap around edges
    if (head.x >= cols) head.x = 0;
    else if (head.x < 0) head.x = cols - 1;
    if (head.y >= rows) head.y = 0;
    else if (head.y < 0) head.y = rows - 1;

    // Check collision with self
    for (let segment of this.body) {
      if (segment.x === head.x && segment.y === head.y) {
        this.length = 1;
        alert("Game Over! Your score was: " + (this.length - 1));
        this.body = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
        this.xSpeed = 0;
        this.ySpeed = 0;
        updateScore(0);
        return;
      }
    }

    this.body.unshift(head);
    if (this.body.length > this.length) {
      this.body.pop();
    }
  }

  changeDirection(direction) {
    if (direction === 'Up' && this.ySpeed === 0) {
      this.xSpeed = 0;
      this.ySpeed = -1;
    } else if (direction === 'Down' && this.ySpeed === 0) {
      this.xSpeed = 0;
      this.ySpeed = 1;
    } else if (direction === 'Left' && this.xSpeed === 0) {
      this.xSpeed = -1;
      this.ySpeed = 0;
    } else if (direction === 'Right' && this.xSpeed === 0) {
      this.xSpeed = 1;
      this.ySpeed = 0;
    }
  }

  eat(foodPosition) {
    let head = this.body[0];
    if (head.x === foodPosition.x && head.y === foodPosition.y) {
      this.length++;
      updateScore(this.length - 1);
      return true;
    }
    return false;
  }
}

class Food {
  constructor() {
    this.position = this.randomPosition();
  }

  randomPosition() {
    return {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };
  }

  draw() {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.position.x * scale, this.position.y * scale, scale, scale);
  }

  relocate() {
    this.position = this.randomPosition();
  }
}

function updateScore(score) {
  document.getElementById('score').innerText = "Score: " + score;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snake.update();

  if (snake.eat(food.position)) {
    food.relocate();
  }

  food.draw();
  snake.draw();
}

// Setup
snake = new Snake();
food = new Food();

// Keyboard controls
window.addEventListener('keydown', e => {
  const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (directions.includes(e.key)) {
    snake.changeDirection(e.key.replace('Arrow', ''));
  }
});

// Image upload handler
document.getElementById('img-upload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      snakeHeadImg = img;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Run game loop every 150ms
setInterval(gameLoop, 150);
