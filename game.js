const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const levelDisplay = document.getElementById('level');
const keysDisplay = document.getElementById('keys');
const livesDisplay = document.getElementById('lives');
const objectiveDisplay = document.getElementById('objective');
const dialog = document.getElementById('dialog');
const dialogText = document.getElementById('dialog-text');
const dialogBtn = document.getElementById('dialog-btn');
const titleScreen = document.getElementById('title-screen');
const singleBtn = document.getElementById('single-btn');
const coopBtn = document.getElementById('coop-btn');
const joinCoopBtn = document.getElementById('join-coop-btn');
const peerIdDisplay = document.getElementById('peer-id-display');
const peerIdSpan = document.getElementById('peer-id');
const coopIdInput = document.getElementById('coop-id-input');
const levelCompleteScreen = document.getElementById('level-complete');
const nextLevelBtn = document.getElementById('next-level-btn');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const victoryScreen = document.getElementById('victory-screen');
const restartVictoryBtn = document.getElementById('restart-victory-btn');
const skinMenu = document.getElementById('skin-menu');
const closeSkinMenuBtn = document.getElementById('close-skin-menu');
const skinOptions = document.querySelectorAll('.skin-option');
const puzzleContainer = document.getElementById('puzzle-container');
const puzzlePieces = document.querySelectorAll('.puzzle-piece');
const puzzleSequence = document.getElementById('puzzle-sequence');
const puzzleSubmit = document.getElementById('puzzle-submit');
const menuBgm = document.getElementById('menu-bgm');
const bgmNormal = document.getElementById('bgm-normal');
const bgmBattle = document.getElementById('bgm-battle');
const hitEnemySound = document.getElementById('hit-sound');
const sfxHitBoss = document.getElementById('boss-hit-sound');
const sfxTakeDamage = document.getElementById('damage-sound');
const sfxChestOpen = document.getElementById('chest-sound');

// Game variables
let currentLevel = 1;
let player = {
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    speed: 5,
    direction: 'right',
    keys: 0,
    lives: 3,
    hasSword: false,
    invincible: false,
    invincibleTimer: 0,
    color: '#00f',
    hasPotion: false,
    damageMultiplier: 1,
    catEars: false,
    earAngle: 0,
    tailAngle: 0,
    isMoving: false,
    id: 'player1',
    keysPressed: {},
    attackCooldown: 0
};
let otherPlayers = {};
let player2 = null;
let levels = [];
let walls = [];
let keys = [];
let enemies = [];
let doors = [];
let npcs = [];
let chests = [];
let campfires = [];
let flowers = [];
let boss = null;
let gameObjects = [];
let puzzleSolution = [];
let puzzleAttempt = [];
let frameCount = 0;
let backgroundImages = {};
let bossDefeated = false;
let isCoopMode = false;
let isHost = false;
let socket = null;
let roomId = null;

// Input handling
const keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    KeyC: false
};

// Pixel art Echo Flower sprites
const echoFlowerFrames = [
    [
        ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#0055AA', '#00AAFF', '#00000000', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#0055AA', '#00AAFF', '#FFFFFF', '#00AAFF', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#00AAFF', '#FFFFFF', '#00AAFF', '#0055AA', '#00000000', '#00000000', '#00000000'],
        ['#0055AA', '#00AAFF', '#00AAFF', '#0055AA', '#00000000', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#0055AA', '#00AAFF', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#0055AA', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000']
    ],
    [
        ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#00000000', '#00AAFF', '#0055AA', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#00AAFF', '#FFFFFF', '#00AAFF', '#0055AA', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#0055AA', '#00AAFF', '#FFFFFF', '#00AAFF', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#00000000', '#0055AA', '#00AAFF', '#00AAFF', '#0055AA', '#00000000'],
        ['#00000000', '#00000000', '#00000000', '#00000000', '#00AAFF', '#0055AA', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#00000000', '#00000000', '#0055AA', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000']
    ]
];

// Function to draw pixel art Echo Flower
function drawPixelArtFlower(flower) {
    const pixelSize = 4;
    const frame = echoFlowerFrames[Math.floor(frameCount / 20) % 2];
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00AAFF';
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const color = frame[y][x];
            if (color !== '#00000000') {
                ctx.fillStyle = color;
                ctx.fillRect(
                    flower.x + x * pixelSize,
                    flower.y + y * pixelSize,
                    pixelSize,
                    pixelSize
                );
            }
        }
    }
    
    ctx.shadowBlur = 0;
}

// Pixel art campfire sprites
const campfireFrames = [
    [
        ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#FF5500', '#FFAA00', '#FF5500', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#FF5500', '#FFAA00', '#FFFF00', '#FFAA00', '#FF5500', '#00000000', '#00000000'],
        ['#00000000', '#FFAA00', '#FFFF00', '#FFAA00', '#FF5500', '#FF5500', '#FF5500', '#00000000'],
        ['#00000000', '#663300', '#663300', '#663300', '#663300', '#663300', '#663300', '#00000000'],
        ['#00000000', '#663300', '#663300', '#663300', '#663300', '#663300', '#663300', '#00000000'],
        ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000']
    ],
    [
        ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#00000000', '#00000000', '#FF5500', '#00000000', '#00000000', '#00000000', '#00000000'],
        ['#00000000', '#FF5500', '#FFAA00', '#FFFF00', '#FFAA00', '#FF5500', '#00000000', '#00000000'],
        ['#00000000', '#FFAA00', '#FFFF00', '#FFAA00', '#FF5500', '#FFAA00', '#FF5500', '#00000000'],
        ['#00000000', '#FF5500', '#FFAA00', '#FF5500', '#FF5500', '#FF5500', '#FF5500', '#00000000'],
        ['#00000000', '#663300', '#663300', '#663300', '#663300', '#663300', '#663300', '#00000000'],
        ['#00000000', '#663300', '#663300', '#663300', '#663300', '#663300', '#663300', '#00000000'],
        ['#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000', '#00000000']
    ]
];

// Function to draw pixel art campfire
function drawPixelArtCampfire(campfire) {
    const pixelSize = 4;
    const frame = campfireFrames[Math.floor(frameCount / 20) % 2];
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const color = frame[y][x];
            if (color !== '#00000000') {
                ctx.fillStyle = color;
                ctx.fillRect(
                    campfire.x + x * pixelSize,
                    campfire.y + y * pixelSize,
                    pixelSize,
                    pixelSize
                );
            }
        }
    }
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF5500';
}

// Initialize levels
function initLevels() {
    levels[1] = {
        walls: [
            {x: 0, y: 0, width: 800, height: 20},
            {x: 0, y: 0, width: 20, height: 600},
            {x: 0, y: 1000, width: 800, height: 20},
            {x: 780, y: 0, width: 20, height: 600},
            {x: 200, y: 100, width: 400, height: 20},
            {x: 200, y: 100, width: 20, height: 200},
            {x: 580, y: 100, width: 20, height: 200},
            {x: 300, y: 400, width: 200, height: 20}
        ],
        keys: [
            {x: 400, y: 300, collected: false}
        ],
        doors: [
            {x: 380, y: 580, width: 40, height: 20, locked: true, leadsTo: 2}
        ],
        npcs: [
            {
                x: 100, y: 100, width: 30, height: 30, 
                dialog: ["Привет, искатель приключений!", "Возьми ключ, чтобы открыть дверь на следующий уровень или ты можешь просто отдохнуть у костра."],
                dialogIndex: 0,
                blinkTimer: Math.floor(Math.random() * 60) + 60,
                blinkState: true
            }
        ],
        enemies: [],
        campfires: [
            {x: 300, y: 200, width: 32, height: 32}
        ],
        flowers: [
            {x: 150, y: 150, width: 32, height: 32},
            {x: 250, y: 350, width: 32, height: 32},
            {x: 450, y: 250, width: 32, height: 32},
            {x: 600, y: 400, width: 32, height: 32}
        ],
        chests: [],
        objective: "Достать ключ",
        startPos: {x: 50, y: 50},
        startPos2: {x: 100, y: 50},
        background: 'level1-bg'
    };
    
    levels[2] = {
        walls: [
            {x: 0, y: 0, width: 0, height: 20},
            {x: 0, y: 0, width: 20, height: 600},
            {x: 0, y: 580, width: 800, height: 20},
            {x: 780, y: 0, width: 20, height: 600},
            {x: 100, y: 100, width: 20, height: 400},
            {x: 100, y: 100, width: 300, height: 20},
            {x: 200, y: 200, width: 20, height: 300},
            {x: 400, y: 200, width: 20, height: 300},
            {x: 500, y: 100, width: 20, height: 300},
            {x: 600, y: 200, width: 20, height: 300},
            {x: 700, y: 100, width: 20, height: 300},
            {x: 100, y: 400, width: 600, height: 20},
            {x: 100, y: 300, width: 200, height: 20},
            {x: 400, y: 300, width: 200, height: 20},
            {x: 200, y: 200, width: 100, height: 20},
            {x: 500, y: 200, width: 100, height: 20}
        ],
        keys: [
            {x: 150, y: 250, collected: false},
            {x: 150, y: 450, collected: false}
        ],
        doors: [
            {x: 380, y: 0, width: 40, height: 20, locked: true, leadsTo: 3}
        ],
        npcs: [
            {
                x: 100, y: 500, width: 30, height: 30, 
                dialog: ["Этот лабиринт полон врагов", "Тебе нужно собрать 2 ключа."],
                dialogIndex: 0,
                blinkTimer: Math.floor(Math.random() * 60) + 60,
                blinkState: true
            }
        ],
        enemies: [
            {x: 150, y: 150, width: 30, height: 30, speed: 3, health: 2, active: false, detectionRadius: 250},
            {x: 350, y: 250, width: 30, height: 30, speed: 3, health: 2, active: false, detectionRadius: 250},
            {x: 550, y: 350, width: 30, height: 30, speed: 3, health: 2, active: false, detectionRadius: 250},
            {x: 650, y: 450, width: 30, height: 30, speed: 3, health: 2, active: false, detectionRadius: 250}
        ],
        campfires: [],
        flowers: [
            {x: 50, y: 450, width: 32, height: 32},
            {x: 300, y: 450, width: 32, height: 32},
            {x: 600, y: 150, width: 32, height: 32}
        ],
        chests: [
            {x: 50, y: 500, width: 30, height: 30, contains: 'sword', opened: false}
        ],
        objective: "Соберите 2 ключа",
        startPos: {x: 50, y: 550},
        startPos2: {x: 100, y: 550},
        background: 'level2-bg'
    };
    
    levels[3] = {
        walls: [
            {x: 0, y: 0, width: 0, height: 20},
            {x: 0, y: 0, width: 20, height: 600},
            {x: 0, y: 580, width: 800, height: 20},
            {x: 780, y: 0, width: 20, height: 600},
            {x: 200, y: 200, width: 400, height: 20},
            {x: 200, y: 400, width: 400, height: 20},
            {x: 100, y: 300, width: 100, height: 20},
            {x: 600, y: 300, width: 100, height: 20},
            {x: 300, y: 100, width: 20, height: 200},
            {x: 500, y: 300, width: 20, height: 200}
        ],
        keys: [],
        doors: [
            {x: 380, y: 0, width: 40, height: 20, locked: true, leadsTo: 4}
        ],
        npcs: [
            {
                x: 400, y: 100, width: 30, height: 30, 
                dialog: ["Реши мою головоломку!", "Последовательность: 4-2-1-3", "Удачи, герой!"],
                dialogIndex: 0,
                hasPuzzle: true,
                blinkTimer: Math.floor(Math.random() * 60) + 60,
                blinkState: true
            }
        ],
        enemies: [
            {x: 250, y: 250, width: 30, height: 30, speed: 3, health: 2, active: false, detectionRadius: 200},
            {x: 550, y: 350, width: 30, height: 30, speed: 3, health: 2, active: false, detectionRadius: 200}
        ],
        campfires: [],
        flowers: [
            {x: 150, y: 350, width: 32, height: 32},
            {x: 450, y: 350, width: 32, height: 32},
            {x: 650, y: 250, width: 32, height: 32}
        ],
        chests: [],
        objective: "Решите головоломку NPC",
        startPos: {x: 400, y: 500},
        startPos2: {x: 450, y: 500},
        background: 'level3-bg'
    };
    
    levels[4] = {
        walls: [
            {x: 0, y: 0, width: 800, height: 20},
            {x: 0, y: 0, width: 20, height: 600},
            {x: 0, y: 580, width: 800, height: 20},
            {x: 780, y: 0, width: 20, height: 600},
            {x: 100, y: 100, width: 600, height: 20},
            {x: 100, y: 100, width: 20, height: 400},
            {x: 100, y: 480, width: 600, height: 20},
            {x: 680, y: 100, width: 20, height: 400}
        ],
        keys: [],
        doors: [],
        npcs: [
            {
                x: 50, y: 300, width: 30, height: 30, 
                dialog: ["Спаси меня, герой!", "Босса нужно ударить 5 раз!", "Нажми C, чтобы открыть меню скинов."],
                dialogIndex: 0,
                blinkTimer: Math.floor(Math.random() * 60) + 60,
                blinkState: true
            }
        ],
        enemies: [],
        campfires: [],
        flowers: [
            {x: 150, y: 150, width: 32, height: 32},
            {x: 650, y: 150, width: 32, height: 32},
            {x: 150, y: 450, width: 32, height: 32},
            {x: 650, y: 450, width: 32, height: 32}
        ],
        chests: [],
        boss: {
            x: 400, y: 200, width: 50, height: 50, 
            speed: 2, health: 5, direction: 'down',
            attackCooldown: 0,
            active: true
        },
        objective: "Победите босса (5 ударов)",
        startPos: {x: 400, y: 500},
        startPos2: {x: 450, y: 500},
        background: 'level4-bg'
    };
}

// Load level
function loadLevel(levelNum) {
    currentLevel = levelNum;
    const level = levels[levelNum];
    
    player.x = level.startPos.x;
    player.y = level.startPos.y;
    player.keys = 0;
    player.invincible = false;
    player.invincibleTimer = 0;
    player.attackCooldown = 0;
    if (levelNum === 1) {
        player.hasSword = false;
        player.hasPotion = false;
        player.damageMultiplier = 1;
        player.catEars = false;
        bossDefeated = false;
    }
    
    if (isCoopMode && player2) {
        player2.x = level.startPos2.x;
        player2.y = level.startPos2.y;
        player2.keys = 0;
        player2.invincible = false;
        player2.invincibleTimer = 0;
        player2.attackCooldown = 0;
        if (levelNum === 1) {
            player2.hasSword = false;
            player2.hasPotion = false;
            player2.damageMultiplier = 1;
            player2.catEars = false;
        }
    }
    
    walls = [...level.walls];
    keys = level.keys.map(key => ({ ...key }));
    doors = level.doors.map(door => {
        if (levelNum === 3) {
            return { ...door, locked: !player.hasPotion && !(player2 && player2.hasPotion) };
        }
        return { ...door };
    });
    npcs = level.npcs.map(npc => ({ ...npc }));
    enemies = level.enemies.map(enemy => ({ ...enemy }));
    chests = level.chests.map(chest => ({ ...chest }));
    campfires = level.campfires.map(campfire => ({ ...campfire }));
    flowers = level.flowers.map(flower => ({ ...flower }));
    boss = level.boss && !bossDefeated ? { ...level.boss } : null;
    gameObjects = [];
    
    levelDisplay.textContent = levelNum;
    objectiveDisplay.textContent = level.objective;
    keysDisplay.textContent = player.keys + (player2 ? player2.keys : 0);
    livesDisplay.textContent = player.lives;
    
    dialog.style.display = 'none';
    levelCompleteScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    victoryScreen.style.display = 'none';
    skinMenu.style.display = 'none';
    puzzleContainer.style.display = 'none';
    
    if (levelNum === 3) {
        puzzleSolution = [4, 2, 1, 3];
        puzzleAttempt = [];
        puzzleSequence.textContent = '';
        
        if (player.hasPotion || (player2 && player2.hasPotion)) {
            objectiveDisplay.textContent = "Пройти к двери";
        }
    }
    
    playBackgroundMusic();
    
    if (isCoopMode && socket && isHost) {
        socket.emit('loadLevel', { roomId, levelNum });
    }
}

// Manage background music
function playBackgroundMusic() {
    const isBattle = enemies.some(enemy => enemy.active);
    if (isBattle) {
        bgmNormal.pause();
        if (bgmBattle.paused) {
            bgmBattle.currentTime = 0;
            bgmBattle.play().catch(e => console.error('Ошибка воспроизведения боевой музыки:', e));
        }
    } else {
        bgmBattle.pause();
        if (bgmNormal.paused) {
            bgmNormal.currentTime = 0;
            bgmNormal.play().catch(e => console.error('Ошибка воспроизведения фоновой музыки:', e));
        }
    }
}

// Input handling
document.addEventListener('keydown', (e) => {
    if (e.code in keysPressed) {
        keysPressed[e.code] = true;
        player.keysPressed[e.code] = true;
        if (isCoopMode && socket) {
            socket.emit('keyDown', { roomId, code: e.code, playerId: player.id });
        }
    }
    
    if (e.code === 'KeyC' && skinMenu.style.display !== 'flex') {
        skinMenu.style.display = 'flex';
        if (isCoopMode && socket) {
            socket.emit('openSkinMenu', { roomId });
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code in keysPressed) {
        keysPressed[e.code] = false;
        player.keysPressed[e.code] = false;
        if (isCoopMode && socket) {
            socket.emit('keyUp', { roomId, code: e.code, playerId: player.id });
        }
    }
});

// Move player
function movePlayer(p) {
    let newX = p.x;
    let newY = p.y;
    p.isMoving = false;
    
    if (p.keysPressed.ArrowUp) {
        newY -= p.speed;
        p.direction = 'up';
        p.isMoving = true;
    }
    if (p.keysPressed.ArrowDown) {
        newY += p.speed;
        p.direction = 'down';
        p.isMoving = true;
    }
    if (p.keysPressed.ArrowLeft) {
        newX -= p.speed;
        p.direction = 'left';
        p.isMoving = true;
    }
    if (p.keysPressed.ArrowRight) {
        newX += p.speed;
        p.direction = 'right';
        p.isMoving = true;
    }
    
    if (p.isMoving) {
        if (checkWallCollision(newX, p.y, p.width, p.height)) {
            if (!checkWallCollision(p.x, newY, p.width, p.height)) {
                p.y = newY;
            }
        } else if (checkWallCollision(p.x, newY, p.width, p.height)) {
            p.x = newX;
        } else {
            p.x = newX;
            p.y = newY;
        }
    }
    
    if (p.catEars) {
        p.earAngle = Math.sin(frameCount * 0.1) * 0.2;
        p.tailAngle = p.isMoving ? Math.sin(frameCount * 0.2) * 0.3 : 0;
    }
    
    checkKeyCollisions(p);
    checkDoorCollisions(p);
    checkNPCCollisions(p);
    checkChestCollisions(p);
    checkEnemyCollisions(p);
    if (boss) checkBossCollision(p);
    
    if (p.keysPressed.Space && p.hasSword) {
        attack(p);
    }
    
    if (p.invincible) {
        p.invincibleTimer--;
        if (p.invincibleTimer <= 0) {
            p.invincible = false;
        }
    }
    if (p.attackCooldown > 0) {
        p.attackCooldown--;
    }
    
    if (isCoopMode && socket) {
        socket.emit('playerUpdate', {
            roomId,
            playerId: p.id,
            x: p.x,
            y: p.y,
            direction: p.direction,
            keys: p.keys,
            lives: p.lives,
            hasSword: p.hasSword,
            hasPotion: p.hasPotion,
            damageMultiplier: p.damageMultiplier,
            catEars: p.catEars
        });
    }
}

// Check wall collisions
function checkWallCollision(x, y, width, height) {
    for (const wall of walls) {
        if (x < wall.x + wall.width &&
            x + width > wall.x &&
            y < wall.y + wall.height &&
            y + height > wall.y) {
            return true;
        }
    }
    return false;
}

// Check key collisions
function checkKeyCollisions(p) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!key.collected &&
            p.x < key.x + 20 &&
            p.x + p.width > key.x &&
            p.y < key.y + 20 &&
            p.y + p.height > key.y) {
            
            key.collected = true;
            p.keys++;
            keysDisplay.textContent = player.keys + (player2 ? player2.keys : 0);
            showDialog(["Вы нашли ключ!"]);
            keys.splice(i, 1);
            if (isCoopMode && socket) {
                socket.emit('keyCollected', { roomId, playerId: p.id, keyIndex: i });
            }
            return;
        }
    }
}

// Check door collisions
function checkDoorCollisions(p) {
    for (const door of doors) {
        if (p.x < door.x + door.width &&
            p.x + p.width > door.x &&
            p.y < door.y + door.height &&
            p.y + p.height > door.y) {
            
            if (door.locked) {
                if (currentLevel === 3 && (p.hasPotion || (player2 && player2.hasPotion))) {
                    door.locked = false;
                    showDialog(["Дверь открыта силой зелья!"]);
                    if (isCoopMode && socket) {
                        socket.emit('doorUnlocked', { roomId, doorIndex: doors.indexOf(door) });
                    }
                } else if (p.keys > 0 || (player2 && player2.keys > 0)) {
                    door.locked = false;
                    p.keys--;
                    if (player2) player2.keys = Math.max(0, player2.keys - (1 - p.keys));
                    keysDisplay.textContent = p.keys + (player2 ? player2.keys : 0);
                    showDialog(["Дверь открыта!"]);
                    if (isCoopMode && socket) {
                        socket.emit('doorUnlocked', { roomId, doorIndex: doors.indexOf(door) });
                    }
                } else {
                    showDialog(["Дверь заперта."]);
                }
            } else {
                levelCompleteScreen.style.display = 'flex';
                if (isCoopMode && socket) {
                    socket.emit('levelComplete', { roomId });
                }
            }
        }
    }
}

// Check NPC collisions
function checkNPCCollisions(p) {
    for (const npc of npcs) {
        if (p.x < npc.x + npc.width &&
            p.x + p.width > npc.x &&
            p.y < npc.y + npc.height &&
            p.y + p.height > npc.y) {
            
            if (npc.hasPuzzle && !p.hasPotion && !(player2 && player2.hasPotion)) {
                puzzleContainer.style.display = 'flex';
                if (isCoopMode && socket) {
                    socket.emit('openPuzzle', { roomId });
                }
            } else {
                showDialog(npc.dialog);
            }
            break;
        }
    }
}

// Check chest collisions
function checkChestCollisions(p) {
    for (const chest of chests) {
        if (!chest.opened &&
            p.x < chest.x + chest.width &&
            p.x + p.width > chest.x &&
            p.y < chest.y + chest.height &&
            p.y + p.height > chest.y) {
            
            chest.opened = true;
            sfxChestOpen.currentTime = 0;
            sfxChestOpen.play().catch(e => console.error('Ошибка воспроизведения звука открытия сундука:', e));
            if (chest.contains === 'sword') {
                p.hasSword = true;
                showDialog(["Вы нашли меч! Атакуйте пробелом."]);
            }
            if (isCoopMode && socket) {
                socket.emit('chestOpened', { roomId, chestIndex: chests.indexOf(chest), playerId: p.id });
            }
        }
    }
}

// Check enemy collisions
function checkEnemyCollisions(p) {
    if (p.invincible) return;
    
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (p.x < enemy.x + enemy.width &&
            p.x + p.width > enemy.x &&
            p.y < enemy.y + enemy.height &&
            p.y + p.height > enemy.y) {
            
            p.lives--;
            livesDisplay.textContent = p.lives;
            sfxTakeDamage.currentTime = 0;
            sfxTakeDamage.play().catch(e => console.error('Ошибка воспроизведения звука получения урона:', e));
            
            if (p.lives <= 0) {
                gameOverScreen.style.display = 'flex';
                if (isCoopMode && socket) {
                    socket.emit('playerDied', { roomId, playerId: p.id });
                }
            } else {
                showDialog(["Вы получили удар!"]);
                p.invincible = true;
                p.invincibleTimer = 120;
                const dx = p.x - enemy.x;
                const dy = p.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                p.x += (dx / distance) * 30;
                p.y += (dy / distance) * 30;
                p.x = Math.max(0, Math.min(canvas.width - p.width, p.x));
                p.y = Math.max(0, Math.min(canvas.height - p.height, p.y));
                if (isCoopMode && socket) {
                    socket.emit('playerUpdate', { roomId, playerId: p.id, x: p.x, y: p.y, lives: p.lives, invincible: p.invincible, invincibleTimer: p.invincibleTimer });
                }
            }
        }
    }
}

// Check boss collision
function checkBossCollision(p) {
    if (p.invincible || !boss) return;
    
    if (p.x < boss.x + boss.width &&
        p.x + p.width > boss.x &&
        p.y < boss.y + boss.height &&
        p.y + p.height > boss.y) {
        
        p.lives--;
        livesDisplay.textContent = p.lives;
        sfxTakeDamage.currentTime = 0;
        sfxTakeDamage.play().catch(e => console.error('Ошибка воспроизведения звука получения урона:', e));
        
        if (p.lives <= 0) {
            gameOverScreen.style.display = 'flex';
            if (isCoopMode && socket) {
                socket.emit('playerDied', { roomId, playerId: p.id });
            }
        } else {
            showDialog(["Босс атаковал вас!"]);
            p.invincible = true;
            p.invincibleTimer = 120;
            const dx = p.x - boss.x;
            const dy = p.y - boss.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            p.x += (dx / distance) * 50;
            p.y += (dy / distance) * 50;
            p.x = Math.max(0, Math.min(canvas.width - p.width, p.x));
            p.y = Math.max(0, Math.min(canvas.height - p.height, p.y));
            if (isCoopMode && socket) {
                socket.emit('playerUpdate', { roomId, playerId: p.id, x: p.x, y: p.y, lives: p.lives, invincible: p.invincible, invincibleTimer: p.invincibleTimer });
            }
        }
    }
}

// Player attack
function attack(p) {
    if (p.attackCooldown > 0) return;
    
    p.attackCooldown = 30;
    
    const attackRange = 40;
    let attackX = p.x;
    let attackY = p.y;
    let attackWidth = p.width;
    let attackHeight = p.height;
    
    switch (p.direction) {
        case 'up':
            attackY -= attackRange;
            attackHeight = attackRange;
            break;
        case 'down':
            attackY += p.height;
            attackHeight = attackRange;
            break;
        case 'left':
            attackX -= attackRange;
            attackWidth = attackRange;
            break;
        case 'right':
            attackX += p.width;
            attackWidth = attackRange;
            break;
    }
    
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (attackX < enemy.x + enemy.width &&
            attackX + attackWidth > enemy.x &&
            attackY < enemy.y + enemy.height &&
            attackY + attackHeight > enemy.y) {
            
            hitEnemySound.play();
            enemy.health -= p.damageMultiplier;
            if (enemy.health <= 0) {
                enemies.splice(i, 1);
                p.lives++;
                livesDisplay.textContent = p.lives;
                showDialog(["Враг повержен! +1 жизнь!"]);
                if (isCoopMode && socket) {
                    socket.emit('enemyDefeated', { roomId, enemyIndex: i, playerId: p.id });
                }
            }
        }
    }
    
    if (boss && 
        attackX < boss.x + boss.width &&
        attackX + attackWidth > boss.x &&
        attackY < boss.y + boss.height &&
        attackY + attackHeight > boss.y &&
        !bossDefeated) {
        
        sfxHitBoss.play();
        boss.health -= 1;
        if (boss.health <= 0) {
            bossDefeated = true;
            boss = null;
            showDialog(["Босс побежден! Вы нашли секретный сундук!"]);
            victoryScreen.style.display = 'flex';
            if (isCoopMode && socket) {
                socket.emit('levelComplete', { roomId });
            }
        }
        if (isCoopMode && socket && isHost) {
            socket.emit('bossUpdate', { roomId, boss });
        }
    }
}

// Move enemies
function moveEnemies() {
    if (isCoopMode && !isHost) return;
    for (const enemy of enemies) {
        const target = player.lives > 0 ? player : (player2 && player2.lives > 0 ? player2 : null);
        if (!target) continue;
        
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < enemy.detectionRadius) {
            enemy.active = true;
        }
        
        if (enemy.active) {
            const newX = enemy.x + (dx / distance) * enemy.speed;
            const newY = enemy.y + (dy / distance) * enemy.speed;
            
            if (!checkWallCollision(newX, newY, enemy.width, enemy.height)) {
                enemy.x = newX;
                enemy.y = newY;
            }
        }
    }
    if (isCoopMode && isHost) {
        socket.emit('enemiesUpdate', { roomId, enemies });
    }
}

// Move boss
function moveBoss() {
    if (isCoopMode && !isHost) return;
    if (!boss || !boss.active) return;
    
    if (boss.attackCooldown > 0) {
        boss.attackCooldown--;
    }
    
    const target = player.lives > 0 ? player : (player2 && player2.lives > 0 ? player2 : null);
    if (!target) return;
    
    const dx = target.x - boss.x;
    const dy = target.y - boss.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 200) {
        const newX = boss.x + (dx / distance) * boss.speed;
        const newY = boss.y + (dy / distance) * boss.speed;
        if (!checkWallCollision(newX, newY, boss.width, boss.height)) {
            boss.x = newX;
            boss.y = newY;
        }
    } else if (boss.attackCooldown === 0) {
        boss.attackCooldown = 60;
        gameObjects.push({
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            width: 10,
            height: 10,
            speed: 5,
            dx: dx / distance,
            dy: dy / distance,
            type: 'bossProjectile'
        });
        if (isCoopMode && isHost) {
            socket.emit('bossProjectile', { roomId, x: boss.x + boss.width / 2, y: boss.y + boss.height / 2, dx: dx / distance, dy: dy / distance });
        }
    }
    
    if (isCoopMode && isHost) {
        socket.emit('bossUpdate', { roomId, boss });
    }
}

// Move projectiles
function moveProjectiles() {
    if (isCoopMode && !isHost) return;
    for (let i = 0; i < gameObjects.length; i++) {
        const obj = gameObjects[i];
        
        if (obj.type === 'bossProjectile') {
            obj.x += obj.dx * obj.speed;
            obj.y += obj.dy * obj.speed;
            
            if (checkWallCollision(obj.x, obj.y, obj.width, obj.height)) {
                gameObjects.splice(i, 1);
                if (isCoopMode && socket) {
                    socket.emit('projectileRemoved', { roomId, index: i });
                }
                continue;
            }
            
            for (const p of [player, player2].filter(p => p && p.lives > 0)) {
                if (!p.invincible && 
                    p.x < obj.x + obj.width &&
                    p.x + p.width > obj.x &&
                    p.y < obj.y + obj.height &&
                    p.y + p.height > obj.y) {
                    
                    p.lives--;
                    livesDisplay.textContent = p.lives;
                    sfxTakeDamage.currentTime = 0;
                    sfxTakeDamage.play().catch(e => console.error('Ошибка воспроизведения звука получения урона:', e));
                    
                    if (p.lives <= 0) {
                        gameOverScreen.style.display = 'flex';
                        if (isCoopMode && socket) {
                            socket.emit('playerDied', { roomId, playerId: p.id });
                        }
                    } else {
                        showDialog(["Снаряд босса попал в вас!"]);
                        p.invincible = true;
                        p.invincibleTimer = 120;
                        const dx = p.x - obj.x;
                        const dy = p.y - obj.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        p.x += (dx / distance) * 50;
                        p.y += (dy / distance) * 50;
                        p.x = Math.max(0, Math.min(canvas.width - p.width, p.x));
                        p.y = Math.max(0, Math.min(canvas.height - p.height, p.y));
                        if (isCoopMode && socket) {
                            socket.emit('playerUpdate', { roomId, playerId: p.id, x: p.x, y: p.y, lives: p.lives, invincible: p.invincible, invincibleTimer: p.invincibleTimer });
                        }
                    }
                    
                    gameObjects.splice(i, 1);
                    if (isCoopMode && socket) {
                        socket.emit('projectileRemoved', { roomId, index: i });
                    }
                    break;
                }
            }
            
            if (obj.x < 0 || obj.x > canvas.width || obj.y < 0 || obj.y > canvas.height) {
                gameObjects.splice(i, 1);
                if (isCoopMode && socket) {
                    socket.emit('projectileRemoved', { roomId, index: i });
                }
            }
        }
    }
    if (isCoopMode && isHost) {
        socket.emit('projectilesUpdate', { roomId, gameObjects });
    }
}

// Improved dialog system
function showDialog(messages) {
    if (messages.length === 0) return;
    
    dialogText.textContent = messages[0];
    dialog.style.display = 'block';
    
    dialogBtn.onclick = () => {
        messages.shift();
        if (messages.length > 0) {
            dialogText.textContent = messages[0];
        } else {
            dialog.style.display = 'none';
        }
        if (isCoopMode && socket) {
            socket.emit('dialogAdvance', { roomId, messages });
        }
    };
    
    dialogText.style.opacity = '0';
    let opacity = 0;
    const fadeIn = setInterval(() => {
        opacity += 0.05;
        dialogText.style.opacity = opacity;
        if (opacity >= 1) clearInterval(fadeIn);
    }, 50);
}

// Convert HEX to RGB
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

// Render game
function draw() {
    frameCount++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const level = levels[currentLevel];
    if (backgroundImages[level.background]) {
        ctx.drawImage(backgroundImages[level.background], 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#111125';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.fillStyle = '#003366';
    for (const wall of walls) {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
    }
    
    for (const flower of flowers) {
        drawPixelArtFlower(flower);
    }
    
    ctx.shadowBlur = 0;
    for (const campfire of campfires) {
        drawPixelArtCampfire(campfire);
    }
    
    for (const key of keys) {
        if (!key.collected) {
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.arc(key.x + 10, key.y + 10, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#ff0';
            ctx.fillRect(key.x + 5, key.y + 5, 10, 5);
        }
    }
    
    for (const door of doors) {
        if (door.locked) {
            ctx.fillStyle = '#663300';
        } else {
            ctx.fillStyle = '#996633';
        }
        ctx.fillRect(door.x, door.y, door.width, door.height);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(door.x, door.y, door.width, door.height);
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(door.x + door.width - 10, door.y + door.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    for (const npc of npcs) {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(npc.x, npc.y, npc.width, npc.height);
        
        ctx.fillStyle = Math.sin(frameCount * 0.1) > 0 ? '#fff' : '#000';
        
        npc.blinkTimer--;
        if (npc.blinkTimer <= 0) {
            npc.blinkState = !npc.blinkState;
            npc.blinkTimer = npc.blinkState ? Math.floor(Math.random() * 60) + 60 : 10;
        }
        
        if (npc.blinkState) {
            ctx.fillRect(npc.x + 5, npc.y + 10, 5, 5);
            ctx.fillRect(npc.x + 20, npc.y + 10, 5, 5);
        }
    }
    
    for (const chest of chests) {
        if (!chest.opened) {
            ctx.fillStyle = '#663300';
            ctx.fillRect(chest.x, chest.y, chest.width, chest.height);
            ctx.strokeStyle = '#ff0';
            ctx.lineWidth = 2;
            ctx.strokeRect(chest.x, chest.y, chest.width, chest.height);
            ctx.strokeStyle = '#ff0';
            ctx.beginPath();
            ctx.moveTo(chest.x + 5, chest.y + 15);
            ctx.lineTo(chest.x + chest.width - 5, chest.y + 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(chest.x + 15, chest.y + 5);
            ctx.lineTo(chest.x + 15, chest.y + chest.height - 5);
            ctx.stroke();
        }
    }
    
    for (const enemy of enemies) {
        ctx.fillStyle = '#f00';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + 5, enemy.y + 10, 5, 5);
        ctx.fillRect(enemy.x + 20, enemy.y + 10, 5, 5);
    }
    
    if (boss) {
        ctx.fillStyle = '#f0f';
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(boss.x, boss.y, boss.width, boss.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(boss.x + 10, boss.y + 15, 10, 5);
        ctx.fillRect(boss.x + 30, boss.y + 15, 10, 5);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boss.x + 10, boss.y + 30);
        ctx.lineTo(boss.x + 40, boss.y + 30);
        ctx.stroke();
        ctx.fillStyle = '#f00';
        ctx.fillRect(boss.x, boss.y - 20, boss.width, 10);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(boss.x, boss.y - 20, boss.width * (boss.health / 5), 10);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(boss.x, boss.y - 20, boss.width, 10);
    }
    
    for (const obj of gameObjects) {
        if (obj.type === 'bossProjectile') {
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    
    for (const p of [player, player2].filter(p => p && p.lives > 0)) {
        if (p.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.fillStyle = `rgba(${hexToRgb(p.color).r},${hexToRgb(p.color).g},${hexToRgb(p.color).b},0.5)`;
        } else {
            ctx.fillStyle = p.color;
        }
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.width, p.height);

for (const id in otherPlayers) {
        const p = otherPlayers[id];
        if (p.lives <= 0) continue;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = '#fff';
        switch (p.direction) {
            case 'up':
                ctx.fillRect(p.x + 10, p.y, 10, 5);
                break;
            case 'down':
                ctx.fillRect(p.x + 10, p.y + p.height - 5, 10, 5);
                break;
            case 'left':
                ctx.fillRect(p.x, p.y + 10, 5, 10);
                break;
            case 'right':
                ctx.fillRect(p.x + p.width - 5, p.y + 10, 5, 10);
                break;
        }
    }
        if (p.catEars) {
            ctx.fillStyle = p.color;
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.moveTo(p.x + 5, p.y);
            ctx.lineTo(p.x + 10, p.y - 15 + p.earAngle * 10);
            ctx.lineTo(p.x + 15, p.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(p.x + 15, p.y);
            ctx.lineTo(p.x + 20, p.y - 15 - p.earAngle * 10);
            ctx.lineTo(p.x + 25, p.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            let tailBaseX, tailBaseY;
            switch (p.direction) {
                case 'up':
                    tailBaseX = p.x + p.width / 2;
                    tailBaseY = p.y + p.height;
                    break;
                case 'down':
                    tailBaseX = p.x + p.width / 2;
                    tailBaseY = p.y;
                    break;
                case 'left':
                    tailBaseX = p.x + p.width;
                    tailBaseY = p.y + p.height / 2;
                    break;
                case 'right':
                    tailBaseX = p.x;
                    tailBaseY = p.y + p.height / 2;
                    break;
            }
            ctx.moveTo(tailBaseX, tailBaseY);
            ctx.quadraticCurveTo(
                tailBaseX + 10, tailBaseY + 10,
                tailBaseX + 30 * Math.cos(p.tailAngle), tailBaseY + 30 * Math.sin(p.tailAngle)
            );
            ctx.stroke();
        }
        
        ctx.fillStyle = '#fff';
        switch (p.direction) {
            case 'up':
                ctx.fillRect(p.x + 10, p.y, 10, 5);
                break;
            case 'down':
                ctx.fillRect(p.x + 10, p.y + p.height - 5, 10, 5);
                break;
            case 'left':
                ctx.fillRect(p.x, p.y + 10, 5, 10);
                break;
            case 'right':
                ctx.fillRect(p.x + p.width - 5, p.y + 10, 5, 10);
                break;
        }
<<<<<<< HEAD
        
        if (p.hasSword) {
            ctx.fillStyle = '#aaa';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            switch (p.direction) {
                case 'up':
                    ctx.fillRect(p.x + p.width / 2 - 5, p.y - 20, 10, 20);
                    ctx.strokeRect(p.x + p.width / 2 - 5, p.y - 20, 10, 20);
                    ctx.fillStyle = '#666';
                    ctx.fillRect(p.x + p.width / 2 - 10, p.y - 10, 20, 5);
                    break;
                case 'down':
                    ctx.fillRect(p.x + p.width / 2 - 5, p.y + p.height, 10, 20);
                    ctx.strokeRect(p.x + p.width / 2 - 5, p.y + p.height, 10, 20);
                    ctx.fillStyle = '#666';
                    ctx.fillRect(p.x + p.width / 2 - 10, p.y + p.height - 5, 20, 5);
                    break;
                case 'left':
                    ctx.fillRect(p.x - 20, p.y + p.height / 2 - 5, 20, 10);
                    ctx.strokeRect(p.x - 20, p.y + p.height / 2 - 5, 20, 10);
                    ctx.fillStyle = '#666';
                    ctx.fillRect(p.x - 10, p.y + p.height / 2 - 10, 5, 20);
                    break;
                case 'right':
                    ctx.fillRect(p.x + p.width, p.y + p.height / 2 - 5, 20, 10);
                    ctx.strokeRect(p.x + p.width, p.y + p.height / 2 - 5, 20, 10);
                    ctx.fillStyle = '#666';
                    ctx.fillRect(p.x + p.width - 5, p.y + p.height / 2 - 10, 5, 20);
                    break;
            }
        }
    }
    
=======
    }    
>>>>>>> 9802a976ea9bd6ca3736819790cbd5b28067b485
    ctx.shadowBlur = 0;
}
}
// Initialize Socket.IO for cooperative mode
function initSocket() {
    socket = io('https://neon-adventure-peerjs.onrender.com', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server:', socket.id);
    });

    socket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err);
        showDialog(["Не удалось подключиться к серверу. Попробуйте снова."]);
    });

    socket.on('roomError', (message) => {
        showDialog([message]);
        socket.disconnect();
    });

    socket.on('roomFull', (message) => {
        showDialog([message]);
        socket.disconnect();
    });

    socket.on('playerDisconnected', (playerId) => {
        showDialog(["Игрок отключился. Возвращаемся в меню..."]);
        setTimeout(() => {
            location.reload();
        }, 3000);
    });

    socket.on('playerUpdate', (data) => {
        if (data.playerId !== player.id && player2) {
        // обновление player2 как раньше
        player2.x = data.x;
        player2.y = data.y;
        player2.direction = data.direction;
        player2.keys = data.keys;
        player2.lives = data.lives;
        player2.hasSword = data.hasSword;
        player2.hasPotion = data.hasPotion;
        player2.damageMultiplier = data.damageMultiplier;
        player2.catEars = data.catEars;
        player2.invincible = data.invincible || false;
        player2.invincibleTimer = data.invincibleTimer || 0;
        livesDisplay.textContent = player.lives;
    } else if (data.playerId !== player.id) {
        // если другой игрок не player2, запишем его в otherPlayers
        if (!otherPlayers[data.playerId]) {
            otherPlayers[data.playerId] = {
                x: data.x,
                y: data.y,
                width: 30,
                height: 30,
                direction: data.direction,
                color: '#f00',
                lives: data.lives
            };
        } else {
            const p = otherPlayers[data.playerId];
            p.x = data.x;
            p.y = data.y;
            p.direction = data.direction;
            p.lives = data.lives;
        }
    }
});

    socket.on('keyDown', (data) => {
        if (data.playerId !== player.id && player2) {
            player2.keysPressed[data.code] = true;
        }
    });

    socket.on('keyUp', (data) => {
        if (data.playerId !== player.id && player2) {
            player2.keysPressed[data.code] = false;
        }
    });

    socket.on('keyCollected', (data) => {
        if (data.keyIndex < keys.length) {
            keys[data.keyIndex].collected = true;
            if (data.playerId === player.id) {
                player.keys++;
            } else if (player2) {
                player2.keys++;
            }
            keys.splice(data.keyIndex, 1);
            keysDisplay.textContent = player.keys + (player2 ? player2.keys : 0);
        }
    });

    socket.on('doorUnlocked', (data) => {
        if (data.doorIndex < doors.length) {
            doors[data.doorIndex].locked = false;
        }
    });

    socket.on('chestOpened', (data) => {
        if (data.chestIndex < chests.length) {
            chests[data.chestIndex].opened = true;
            if (chests[data.chestIndex].contains === 'sword') {
                if (data.playerId === player.id) {
                    player.hasSword = true;
                } else if (player2) {
                    player2.hasSword = true;
                }
            }
        }
    });

    socket.on('enemyDefeated', (data) => {
        if (data.enemyIndex < enemies.length) {
            enemies.splice(data.enemyIndex, 1);
            if (data.playerId === player.id) {
                player.lives++;
            } else if (player2) {
                player2.lives++;
            }
            livesDisplay.textContent = player.lives;
        }
    });

    socket.on('playerDied', (data) => {
        if (data.playerId === player.id) {
            player.lives = 0;
        } else if (player2 && data.playerId === player2.id) {
            player2.lives = 0;
        }
        gameOverScreen.style.display = 'flex';
    });

    socket.on('loadLevel', (data) => {
        loadLevel(data.levelNum);
    });

    socket.on('levelComplete', () => {
        levelCompleteScreen.style.display = 'flex';
    });

    socket.on('openPuzzle', () => {
        puzzleContainer.style.display = 'flex';
    });

    socket.on('openSkinMenu', () => {
        skinMenu.style.display = 'flex';
    });

    socket.on('dialogAdvance', (data) => {
        showDialog(data.messages);
    });

    socket.on('bossUpdate', (data) => {
        if (boss) {
            Object.assign(boss, data.boss);
        }
    });

    socket.on('bossProjectile', (data) => {
        gameObjects.push({
            x: data.x,
            y: data.y,
            width: 10,
            height: 10,
            speed: 5,
            dx: data.dx,
            dy: data.dy,
            type: 'bossProjectile'
        });
    });

    socket.on('projectileRemoved', (data) => {
        if (data.index < gameObjects.length) {
            gameObjects.splice(data.index, 1);
        }
    });

    socket.on('enemiesUpdate', (data) => {
        enemies = data.enemies.map(e => ({ ...e }));
    });

    socket.on('projectilesUpdate', (data) => {
        gameObjects = data.gameObjects.map(o => ({ ...o }));
    });

    socket.on('puzzleAttempt', (data) => {
        if (puzzleAttempt.length < 4) {
            puzzleAttempt.push(data.value);
            puzzleSequence.textContent = puzzleAttempt.join('-');
        }
    });

    socket.on('puzzleSolved', () => {
        player.hasPotion = true;
        if (player2) player2.hasPotion = true;
        puzzleContainer.style.display = 'none';
        objectiveDisplay.textContent = "Пройти к двери";
        doors.forEach(door => door.locked = false);
    });

    socket.on('puzzleReset', () => {
        puzzleAttempt = [];
        puzzleSequence.textContent = '';
    });
}

// Host cooperative game
function initHost() {
    isHost = true;
    isCoopMode = true;
    initSocket();

    socket.on('connect', () => {
        roomId = socket.id;
        peerIdSpan.textContent = roomId;
        peerIdDisplay.style.display = 'block';
        showDialog(["Поделитесь этим ID с другом: " + roomId]);

        player2 = {
            x: levels[1].startPos2.x,
            y: levels[1].startPos2.y,
            width: 30,
            height: 30,
            speed: 5,
            direction: 'right',
            keys: 0,
            lives: 3,
            hasSword: false,
            invincible: false,
            invincibleTimer: 0,
            color: '#f00',
            hasPotion: false,
            damageMultiplier: 1,
            catEars: false,
            earAngle: 0,
            tailAngle: 0,
            isMoving: false,
            id: 'player2',
            keysPressed: {},
            attackCooldown: 0
        };

        loadLevel(1);
        titleScreen.style.display = 'none';
        menuBgm.pause();
        gameLoop();
    });

    socket.on('playerJoined', (playerId) => {
        console.log('Player joined:', playerId);
        socket.emit('sendState', {
            target: playerId,
            state: {
                level: currentLevel,
                player: { ...player, id: 'player1' },
                player2: { ...player2, id: 'player2' },
                walls,
                keys,
                doors,
                npcs,
                enemies,
                chests,
                campfires,
                flowers,
                boss,
                gameObjects
            }
        });
    });
}

// Join cooperative game
function joinCoop(peerId) {
    if (!peerId) {
        showDialog(["Введите ID хоста!"]);
        return;
    }

    isHost = false;
    isCoopMode = true;
    roomId = peerId;
    initSocket();

    socket.on('connect', () => {
        socket.emit('joinRoom', roomId);
    });

    socket.on('gameState', (state) => {
        currentLevel = state.level;
        player = { ...state.player2, id: 'player2', color: '#f00' };
        player2 = { ...state.player, id: 'player1', color: '#00f' };
        walls = state.walls.map(w => ({ ...w }));
        keys = state.keys.map(k => ({ ...k }));
        doors = state.doors.map(d => ({ ...d }));
        npcs = state.npcs.map(n => ({ ...n }));
        enemies = state.enemies.map(e => ({ ...e }));
        chests = state.chests.map(c => ({ ...c }));
        campfires = state.campfires.map(c => ({ ...c }));
        flowers = state.flowers.map(f => ({ ...f }));
        boss = state.boss ? { ...state.boss } : null;
        gameObjects = state.gameObjects.map(o => ({ ...o }));

        levelDisplay.textContent = currentLevel;
        objectiveDisplay.textContent = levels[currentLevel].objective;
        keysDisplay.textContent = player.keys + (player2 ? player2.keys : 0);
        livesDisplay.textContent = player.lives;

        titleScreen.style.display = 'none';
        menuBgm.pause();
        gameLoop();
    });
}

// Main game loop
function gameLoop() {
    if (titleScreen.style.display !== 'none' || gameOverScreen.style.display === 'flex' || 
        levelCompleteScreen.style.display === 'flex' || victoryScreen.style.display === 'flex' || 
        skinMenu.style.display === 'flex' || puzzleContainer.style.display === 'flex') {
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (player.lives > 0) movePlayer(player);
    if (player2 && player2.lives > 0) movePlayer(player2);
    
    if (isHost || !isCoopMode) {
        moveEnemies();
        moveBoss();
        moveProjectiles();
    }
    
    playBackgroundMusic();
    
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Event handlers
singleBtn.addEventListener('click', () => {
    isCoopMode = false;
    titleScreen.style.display = 'none';
    menuBgm.pause();
    loadLevel(1);
    gameLoop();
});

coopBtn.addEventListener('click', () => {
    initHost();
});

joinCoopBtn.addEventListener('click', () => {
    const peerId = coopIdInput.value.trim();
    joinCoop(peerId);
});

nextLevelBtn.addEventListener('click', () => {
    loadLevel(levels[currentLevel].doors[0].leadsTo);
});

restartBtn.addEventListener('click', () => {
    player.lives = 3;
    if (player2) player2.lives = 3;
    loadLevel(1);
});

restartVictoryBtn.addEventListener('click', () => {
    player.lives = 3;
    if (player2) player2.lives = 3;
    loadLevel(1);
});

closeSkinMenuBtn.addEventListener('click', () => {
    skinMenu.style.display = 'none';
    if (isCoopMode && socket) {
        socket.emit('closeSkinMenu', { roomId });
    }
});

skinOptions.forEach(option => {
    option.addEventListener('click', () => {
        const color = option.dataset.color;
        const catEars = option.dataset.catEars === 'true';
        player.color = color || player.color;
        if (catEars) player.catEars = true;
        if (isCoopMode && socket) {
            socket.emit('playerUpdate', { roomId, playerId: player.id, color: player.color, catEars: player.catEars });
        }
    });
});

puzzlePieces.forEach(piece => {
    piece.addEventListener('click', () => {
        if (puzzleAttempt.length < 4) {
            puzzleAttempt.push(parseInt(piece.dataset.value));
            puzzleSequence.textContent = puzzleAttempt.join('-');
            if (isCoopMode && socket) {
                socket.emit('puzzleAttempt', { roomId, value: parseInt(piece.dataset.value) });
            }
        }
    });
});

puzzleSubmit.addEventListener('click', () => {
    if (puzzleAttempt.length === 4) {
        if (puzzleAttempt.every((val, i) => val === puzzleSolution[i])) {
            player.hasPotion = true;
            if (player2) player2.hasPotion = true;
            puzzleContainer.style.display = 'none';
            showDialog(["Головоломка решена! Вы получили зелье!"]);
            objectiveDisplay.textContent = "Пройти к двери";
            doors.forEach(door => door.locked = false);
            if (isCoopMode && socket) {
                socket.emit('puzzleSolved', { roomId });
            }
        } else {
            puzzleAttempt = [];
            puzzleSequence.textContent = '';
            showDialog(["Неправильная последовательность. Попробуйте снова."]);
            if (isCoopMode && socket) {
                socket.emit('puzzleReset', { roomId });
            }
        }
    }
});

// Initialize game
initLevels();
