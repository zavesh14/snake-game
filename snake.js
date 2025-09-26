
// Get the canvas element and its drawing context
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Size of each grid box (pixel size of snake and food)
const box = 20;


// Snake array, each element is a segment (object with x, y coordinates)
let snake = [{ x: 9 * box, y: 10 * box }];

// High score (stored in localStorage)
let highScore = localStorage.getItem('snakeHighScore') || 0;

// Score display elements
const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');

// Current direction of the snake ('LEFT', 'RIGHT', 'UP', 'DOWN')
let direction = null;

// Food object with random x and y position
let food = {
  x: Math.floor(Math.random() * 20) * box,
  y: Math.floor(Math.random() * 20) * box
};

// Obstacles array, each element is an object with x, y coordinates
let obstacles = generateObstacles();

// Function to generate random obstacles
function generateObstacles() {
  let obs = [];
  // Add 5 obstacles at random positions (not on snake or food)
  while (obs.length < 5) {
    let ox = Math.floor(Math.random() * 20) * box;
    let oy = Math.floor(Math.random() * 20) * box;
    // Avoid placing on snake or food
    if (
      (snake[0].x === ox && snake[0].y === oy) ||
      (food.x === ox && food.y === oy) ||
      obs.some(o => o.x === ox && o.y === oy)
    ) continue;
    obs.push({ x: ox, y: oy });
  }
  return obs;
}

// Player's score
let score = 0;

// Listen for arrow key presses to change snake direction
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});

// Main game loop: draws everything and updates the game state
function draw() {

  // Draw a colorful gradient background
  let gradient = ctx.createLinearGradient(0, 0, 400, 400);
  gradient.addColorStop(0, '#1e3c72');
  gradient.addColorStop(1, '#2a5298');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 400);

  // Draw the border
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 400, 400);

  // Draw obstacles (solid dark gray squares)
  ctx.fillStyle = '#333';
  for (let i = 0; i < obstacles.length; i++) {
    ctx.fillRect(obstacles[i].x, obstacles[i].y, box, box);
  }

  // Draw the snake
  for (let i = 0; i < snake.length; i++) {
    if (i === 0) {
      // Glowing effect for head
      ctx.save();
      ctx.shadowColor = 'lime';
      ctx.shadowBlur = 20;
      ctx.font = '20px Arial';
      ctx.fillText('🟩', snake[i].x, snake[i].y + box - 2);
      ctx.restore();
    } else {
      ctx.font = '20px Arial';
      ctx.fillText('🟩', snake[i].x, snake[i].y + box - 2);
    }
  }

  // Draw the food (fruit emoji)
  ctx.font = '20px Arial';
  ctx.fillText('🍎', food.x, food.y + box - 2);

  // Calculate new head position based on direction
  let head = { x: snake[0].x, y: snake[0].y };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'DOWN') head.y += box;

  // Make the snake pass through walls (wrap around)
  if (head.x < 0) head.x = 400 - box;
  if (head.x >= 400) head.x = 0;
  if (head.y < 0) head.y = 400 - box;
  if (head.y >= 400) head.y = 0;


  // Check if snake eats the food
  if (head.x === food.x && head.y === food.y) {
    score++; // Increase score
    // Place new food at a random position (not on obstacles)
    let valid = false;
    while (!valid) {
      food = {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box
      };
      valid = !obstacles.some(o => o.x === food.x && o.y === food.y);
    }
  } else {
    // Remove the tail segment if no food eaten
    snake.pop();
  }

  // Check for collision with itself (game over)
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    clearInterval(game); // Stop the game loop
    // Show Try Again button
    document.getElementById('tryAgainBtn').style.display = 'inline-block';
    return;
  }

  // Check for collision with obstacles (game over)
  if (obstacles.some(o => o.x === head.x && o.y === head.y)) {
    clearInterval(game);
    document.getElementById('tryAgainBtn').style.display = 'inline-block';
    return;
  }

  // Add new head to the snake
  snake.unshift(head);

  // Update the score and high score display outside the canvas
  if (scoreDisplay) scoreDisplay.textContent = 'Score: ' + score;
  if (highScoreDisplay) highScoreDisplay.textContent = 'High Score: ' + highScore;
}

// Start the game loop, calling draw() every 100ms

// Function to reset the game state
function resetGame() {
  // Update high score if needed
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
  }
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  food = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
  };
  obstacles = generateObstacles();
  score = 0;
  document.getElementById('tryAgainBtn').style.display = 'none';
  game = setInterval(draw, 100);
}

// Attach event listener to Try Again button
document.getElementById('tryAgainBtn').addEventListener('click', resetGame);

let game = setInterval(draw, 100);
