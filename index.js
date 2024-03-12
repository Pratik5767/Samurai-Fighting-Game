const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// defining width of the canvas
canvas.width = 1024;
canvas.height = 576;
c.fillRect(0, 0, canvas.width, canvas.height)

// resizing the width of the as per windows size
window.addEventListener("resize", function () {
    canvas.width = 1024;
    canvas.height = 576;
    c.fillRect(0, 0, canvas.width, canvas.height)
    render();
});

const gravity = 0.7;

const backGround = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/background.png'
})

const shop = new Sprite({
    position: {
        x: 600,
        y: 130
    },
    imageSrc: './assets/shop.png',
    scale: 2.75,
    frameMax: 6
})

// creating the object Player and Enemy
const Player = new Fighter({
    position: {
        x: 100,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0,
    },
    offset: {
        x: 0,
        y: 0,
    },
    imageSrc: './assets/samuraiMack/Idle.png',
    frameMax: 8,
    scale: 2.5,
    offset: {
        x: 215,
        y: 157
    },
    sprites: {
        idle: {
            imageSrc: './assets/samuraiMack/Idle.png',
            frameMax: 8
        },
        run: {
            imageSrc: './assets/samuraiMack/Run.png',
            frameMax: 8
        },
        jump: {
            imageSrc: './assets/samuraiMack/Jump.png',
            frameMax: 2,
        },
        fall: {
            imageSrc: './assets/samuraiMack/Fall.png',
            frameMax: 2
        },
        attack1: {
            imageSrc: './assets/samuraiMack/Attack1.png',
            frameMax: 6
        },
        takeHit: {
            imageSrc: './assets/samuraiMack/TakeHit-white-silhouette.png',
            frameMax: 4
        },
        death: {
            imageSrc: './assets/samuraiMack/Death.png',
            frameMax: 6
        }
    },
    attackBox: {
        offset: {
            x: 70,
            y: 50
        },
        width: 170,
        height: 50
    }
})

const Enemy = new Fighter({
    position: {
        x: 800,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: -50,
        y: 0,
    },
    color: 'blue',
    imageSrc: './assets/Kenji/Idle.png',
    frameMax: 4,
    scale: 2.5,
    offset: {
        x: 215,
        y: 167
    },
    sprites: {
        idle: {
            imageSrc: './assets/Kenji/Idle.png',
            frameMax: 4
        },
        run: {
            imageSrc: './assets/Kenji/Run.png',
            frameMax: 8
        },
        jump: {
            imageSrc: './assets/Kenji/Jump.png',
            frameMax: 2,
        },
        fall: {
            imageSrc: './assets/Kenji/Fall.png',
            frameMax: 2
        },
        attack1: {
            imageSrc: './assets/Kenji/Attack1.png',
            frameMax: 4
        },
        takeHit: {
            imageSrc: './assets/Kenji/Takehit.png',
            frameMax: 3,
        },
        death: {
            imageSrc: './assets/Kenji/Death.png',
            frameMax: 7
        }
    },
    attackBox: {
        offset: {
            x: -170,
            y: 50
        },
        width: 170,
        height: 50
    }
})

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    backGround.update();
    shop.update();
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    Player.update();
    Enemy.update();

    Player.velocity.x = 0
    Enemy.velocity.x = 0

    // Player Movement
    if (keys.a.pressed && Player.lastKey === 'a') {
        Player.velocity.x = -5
        Player.switchSprite('run')
    }
    else if (keys.d.pressed && Player.lastKey === 'd') {
        Player.velocity.x = 5
        Player.switchSprite('run')
    }
    else {
        Player.switchSprite('idle')
    }

    // Player Jumping
    if (Player.velocity.y < 0) {
        Player.switchSprite('jump')
    }
    else if (Player.velocity.y > 0) {
        Player.switchSprite('fall')
    }

    // Enemy Movement
    if (keys.ArrowLeft.pressed && Enemy.lastKey === 'ArrowLeft') {
        Enemy.velocity.x = -5
        Enemy.switchSprite('run')
    }
    else if (keys.ArrowRight.pressed && Enemy.lastKey === 'ArrowRight') {
        Enemy.velocity.x = 5
        Enemy.switchSprite('run')
    }
    else {
        Enemy.switchSprite('idle')
    }

    // Enemy Jumping
    if (Enemy.velocity.y < 0) {
        Enemy.switchSprite('jump')
    }
    else if (Enemy.velocity.y > 0) {
        Enemy.switchSprite('fall')
    }

    // detect for collision & Enemy gets hit
    if (retangularCollision({
        rectangle1: Player,
        rectangle2: Enemy,
    }) && Player.isAttacking && Player.frameCurrent === 4) {
        Enemy.takeHit();
        Player.isAttacking = false;
        gsap.to('#enemyHealth', {
            width: Enemy.health + '%'
        })
    }

    // if player misses
    if (Player.isAttacking && Player.frameCurrent === 4) {
        Player.isAttacking = false
    }

    // detect for collision & Player gets hit
    if (retangularCollision({
        rectangle1: Enemy,
        rectangle2: Player,
    }) && Enemy.isAttacking && Enemy.frameCurrent === 2) {
        Player.takeHit();
        Enemy.isAttacking = false;
        gsap.to('#playerHealth', {
            width: Player.health + '%'
        })
    }

    // if Enemy misses
    if (Enemy.isAttacking && Enemy.frameCurrent === 2) {
        Enemy.isAttacking = false
    }

    // End the game
    if (Enemy.health <= 0 || Player.health <= 0) {
        determineWinner({ Player, Enemy, timerId })
    }
}

animate();

window.addEventListener('keydown', (event) => {
    if (!Player.dead) {
        switch (event.key) {
            // Player 
            case 'd':
                keys.d.pressed = true
                Player.lastKey = 'd'
                break;
            case 'a':
                keys.a.pressed = true
                Player.lastKey = 'a'
                break;
            case 'w':
                Player.velocity.y = -20
                break;
            case ' ':
                Player.attack()
                break
        }
    }

    if (!Enemy.dead) {
        switch (event.key) {
            // Enemy 
            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                Enemy.lastKey = 'ArrowRight'
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                Enemy.lastKey = 'ArrowLeft'
                break;
            case 'ArrowUp':
                Enemy.velocity.y = -20
                break;
            case 'ArrowDown':
                Enemy.attack()
                break;
        }
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        // Player
        case 'd':
            keys.d.pressed = false
            break;
        case 'a':
            keys.a.pressed = false
            break;

        // Enemy 
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break;
    }
})