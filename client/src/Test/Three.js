import React, {useEffect, useRef, useState} from 'react'
import Phaser from 'phaser'

class MainScene extends Phaser.Scene {
    constructor(score, setScore, setGameOver) {
        super({key: 'MainScene'})
        this.setScore = setScore
        this.score = score
        this.setGameOver = setGameOver
    }

    preload() {
        this.load.spritesheet('cat', '/images/player.png', {
            frameWidth: 50,
            frameHeight: 50,
        })
        this.load.image('beer', '/images/beer.png')
    }

    create() {
        this.player = this.physics.add.sprite(400, 300, 'cat').setScale(2).setOffset(0, 0).setSize(5, 5)
        this.player.setCollideWorldBounds(true)

        // Анимации игрока
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('cat', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1,
        })
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('cat', {start: 4, end: 7}),
            frameRate: 10,
            repeat: -1,
        })
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('cat', {start: 8, end: 11}),
            frameRate: 10,
            repeat: -1,
        })
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('cat', {start: 12, end: 15}),
            frameRate: 10,
            repeat: -1,
        })

        this.cursors = this.input.keyboard.createCursorKeys()

        this.beers = this.physics.add.group()
        this.physics.add.overlap(this.player, this.beers, (player, beer) => {
            this.collectBeer(player, beer)
        }, null, this)

        this.time.addEvent({
            delay: 2000,
            callback: () => {
                const randomX = Math.floor(Math.random() * 800)
                const randomY = Math.floor(Math.random() * 600)
                this.spawnBeer(randomX, randomY)
            },
            loop: true
        })
    }

    spawnBeer(x, y) {
        const beer = this.beers.create(x, y, 'beer')
        beer.setData('collected', false)
        beer.setImmovable(true).setScale(2).setOffset(0, 0)
        beer.body.setAllowGravity(false)

    }

    collectBeer(player, beer) {
        if (beer.getData('collected')) return
        beer.setData('collected', true)
        this.tweens.add({
            targets: beer,
            y: beer.y - 60,
            duration: 500,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: beer,
                    y: beer.y + 80,
                    duration: 100,
                    ease: 'Cubic.easeIn',
                    onComplete: () => {
                        this.tweens.add({
                            targets: beer,
                            alpha: 0,
                            duration: 150,
                            ease: 'Linear',
                            onComplete: () => {
                                beer.disableBody(true, true)
                                this.score = this.score + 1
                                if (this.score >= 10) {
                                    this.endGame()
                                }
                            }
                        })
                    }
                })
            }
        })

        this.setScore(prev => prev + 1)
    }

    endGame() {
        this.scene.pause()
        this.add.text(400, 300, '🎉 Победа!', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5)
        this.setGameOver(true)
        this.score = 0
    }

    update() {
        const speed = 160
        const player = this.player
        const cursors = this.cursors

        let velocityX = 0
        let velocityY = 0

        if (cursors.left.isDown) {
            velocityX = -speed
            player.anims.play('left', true)
        } else if (cursors.right.isDown) {
            velocityX = speed
            player.anims.play('right', true)
        }

        if (cursors.up.isDown) {
            velocityY = -speed
            player.anims.play('up', true)
        } else if (cursors.down.isDown) {
            velocityY = speed
            player.anims.play('down', true)
        }

        if (velocityX === 0 && velocityY === 0) {
            player.setVelocity(0)
            player.anims.stop()
        } else {
            player.setVelocity(velocityX, velocityY)
        }
    }
}

function PhaserGame() {
    const gameRef = useRef(null)
    const phaserGameRef = useRef(null)
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [restartKey, setRestartKey] = useState(0)
    const [stopGame, setStopGame] = useState(false)

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: gameRef.current,
            backgroundColor: '#87ceeb',
            audio: {noAudio: true},
            physics: {
                default: 'arcade',
                arcade: {gravity: {y: 0}},
            },
            scene: new MainScene(score, setScore, setGameOver),
        }

        phaserGameRef.current = new Phaser.Game(config)

        return () => {
            phaserGameRef.current.destroy(true)
        }
    }, [restartKey])

    function onClickRestart() {
        setRestartKey(prev => prev + 1)
        setGameOver(false)
        setScore(0)
    }

    return (
        <div style={{position: 'relative', width: 800, height: 600}}>
            {!stopGame ? (
                <>
                    <div ref={gameRef} style={{width: '100%', height: '100%'}}/>
                    <p>{score}</p>
                </>
            ) : <h1>Ну всё</h1>}
            {gameOver && (!stopGame &&
                <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '30%',
                    width: '40%',
                    background: 'rgba(0,0,0,0.7)',
                    padding: 20,
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: 8
                }}>
                    <h2>🎮 Игра окончена!</h2>
                    <button onClick={onClickRestart}>Начать заново</button>
                    <button onClick={() => setStopGame(true)}>Закончить играть</button>
                </div>
            )}
        </div>
    );
}

export default PhaserGame
