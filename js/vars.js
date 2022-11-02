"use strict";
var vars = {
    DEBUG: false,
    name: 'Going Dotty',

    version: 1.12,

    versionInfo: [
        { v: 0.99,
            info: 'Actually v1.0. The reason for the numbering discrepency is because Ive made new pixel colours for the players (as the current ones are too bright).\
                    Unfortunately my base64 script is on my main machine. So the game IS 1.0 sans the new square colours'
        },
        { v: 1.01,
            info: 'Added particles to the new game screen'
        },
        { v: 1.1,
            info: 'Updated to new squares colours.\
                    Added the difficulty selector the the options screen. Works well :)'
        },
        { v: 1.11,
            info: 'Minor timing bug causing the win screen to break is now fixed'
        },
        { v: 1.12,
            info: 'Added dev bounce'
        }
    ],

    fonts: {
        default:  { fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '36px', color: '#ffffff', stroke: '#000000', strokeThickness: 3, align: 'center', lineSpacing: 20 }
    },

    init: function(_phase) {
        switch (_phase) {
            case 'PRELOAD': // PRELOADS
                vars.files.loadAssets();
                vars.localStorage.init();
                break;
            case 'CREATE': // CREATES
                vars.anims.init();
                vars.audio.init();
                vars.containers.init();
                vars.groups.init();
                vars.input.init();
                //vars.particles.init();
                //vars.shaders.init();
                vars.UI.init();
                break;
            case 'STARTAPP': // GAME IS READY TO PLAY
                vars.game.init();
            break;

            default:
                console.error(`Phase (${_phase}) was invalid!`);
                return false;
            break;
        }
    },

    files: {
        audio: {
            load: function() {
                //scene.load.audio('audiokey', 'audio/audiokey.ogg');
            }
        },

        images: {
            available: [],
            header: 'data:image/png;base64,',
            preA: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCA',
            preB: 'AAAAA6fptV[d]QIHW',
            postC: 'AAAABJRU5ErkJggg==',
            postD: 'AAAACklEQV',
            postE: 'IAAACQd1Pe',
            postF: 'AAAADElEQVR42m',
            postG: 'AAAAAElFTkSuQmCC',
            base64s: {
                'blackpixel'        : '[a][e][d]R4AWMAAgAABAABsYaQRA[c]',
                'whitepixel'        : '[a][b]P4DwABAQEANl9ngA[c]',
                'pixel2'            : '[a][b]NQAgAAJAAjw8NKCg[c]',
                'pixel3'            : '[a][b]MwBgAANQA0TdMIeQ[c]',
                'pixel6'            : '[a][b]NIAwAAaABnVJ+6Kw[c]',
                'pixel9'            : '[a][b]OYCQAAmwCaKknZIA[c]',
                'pixel15'           : '[a][b]MQBQAAFwAW6lOQIQ[c]',
                'pixelC'            : '[a][b]M4AwAAzgDNUwEBJA[c]',

                'pixelp1'           : '[a][e][f]No8PUFAAJrARu8dLmV[g]',
                'pixelp2'           : '[a][e][f]PwbfAFAAI4ARtFfkfd[g]',
                'pixelp3'           : '[a][e][f]Pw9W0AAAIFARtLehgV[g]',
                'pixelp4'           : '[a][e][f]NoaPAFAALRAU7B4efL[g]',
            },
            init: ()=> {
                let fIV = vars.files.images;
                let base64s = fIV.base64s;
                let header = fIV.header;
                let preA = fIV.preA;
                let preB = fIV.preB;
                let postC = fIV.postC;
                let postD = fIV.postD;
                let postE = fIV.postE;
                let postF = fIV.postF;
                let postG = fIV.postG;
                for (let b in base64s) {
                    let b64 = header + base64s[b];
                    let newb64 = b64.replace('[a]', preA).replace('[b]',preB).replace('[c]',postC).replace('[d]',postD).replace('[e]',postE).replace('[f]',postF).replace('[g]',postG);
                    scene.textures.addBase64(b, newb64);
                    fIV.available.push(b);
                };

            },
            load: ()=> {
                vars.files.images.init();

                scene.load.atlas('ui', 'images/ui.png', 'images/ui.json');
            }
        },

        loadAssets: ()=> {
            let fV = vars.files;
            scene.load.path='assets/';

            fV.images.load();
            fV.audio.load();
        }
    },

    containers: {
        init: ()=> {
            let depths = consts.depths;
            !scene.containers ? scene.containers = {} : null;
            //scene.containers.game = scene.add.container().setName('game').setDepth(depths.gameMap);
        }
    },

    groups: {
        init: ()=> {
            scene.groups = { };
            //scene.groups.groupName = scene.add.group().setName('groupName');
        }
    },

    localStorage: {
        pre: 'GDY_',

        init: ()=> {
            let lV = vars.localStorage;
            let lS = window.localStorage;
            let pre = lV.pre;

            if (!lS[`${pre}options`]) {
                //generate the options string
                let options = { names: vars.game.playerNames, options: vars.game.options };
                lS[`${pre}options`] = JSON.stringify(options);
            };

            let options = JSON.parse(lS[`${pre}options`]);
            vars.game.playerNames = options.names;
            vars.game.options = options.options;
        },

        saveOptions: ()=> {
            vars.DEBUG && console.log(`%cSaving options`, 'color: #ff4d4d');
            let lV = vars.localStorage;
            let lS = window.localStorage;
            let pre = lV.pre;

            let options = { names: vars.game.playerNames, options: vars.game.options };
            lS[`${pre}options`] = JSON.stringify(options);
        }
    },



    // GAME/APP
    anims: {
        init: ()=> {
            vars.DEBUG ? console.log(`FN: anims > init`) : null;
            
        }
    },

    audio: {
        available: [],

        init: ()=> {
            vars.DEBUG ? console.log(`FN: audio > init`) : null;

            scene.sound.volume=0.4;
        },

        playSound: (_key)=> {
            vars.DEBUG ? console.log(`  >> audio > playSound`) : null;

            scene.sound.play(_key);
        },
    },

    camera: {
        // cameras
        mainCam: null,

        init: ()=> {
            vars.DEBUG && console.log(`FN: camera > init`);
            vars.camera.mainCam = scene.cameras.main;
        }
    },

    game: {
        board: null,
        nameEntry: null,
        options: { difficulty: 1, difficultySettings: [5,10,15,20], playerCurrent: 1, playersTotal: 2, playersMin: 2, playersMax: 4 },
        players: {
            p1: null,
            p2: null,
            p3: null,
            p4: null
        },
        playerColours: [0xff4d4d,0x4dff4d,0x4d4dff,0xffff4d],
        playerNames: ['P1','P2','P3','P4'],
        getCurrentPlayer: ()=> {
            return vars.game.players[`p${vars.game.options.playerCurrent}`];
        },
        getNextPlayer: (_returnPlayer=false)=> {
            let gV = vars.game;
            let options = gV.options;

            options.playerCurrent++;
            options.playerCurrent>options.playersTotal && (options.playerCurrent=1);

            if (!_returnPlayer) return (`p${options.playerCurrent}`); // the actual player wasnt needed, just the player id, se return it

            return gV.players[`p${options.playerCurrent}`];
        },
        playersReset() {
            let players = vars.game.players;
            for (let p in players) { players[p]=null; };
        },

        init: ()=> {
           vars.DEBUG ? console.log(`\nFN: game > init`) : null;

        },

        generateNewBoardAndScoreCard: ()=> {
            let gV = vars.game;
            gV.board = new Board();
            gV.scoreCard = new ScoreCard();
            
            scene.tweens.addCounter({
                from: 0, to: 1, useFrames: true, duration: 10,
                onComplete: ()=> { gV.scoreCard.updateBoxesLeft(gV.board.squaresLeft, true); }
            });
            
        },

        generatePlayers: ()=> {
            let gV = vars.game;
            let options = gV.options;
            for (let p=1; p<=options.playersTotal; p++) {
                gV.players[`p${p}`] = new Player(p);
            };
        },

        showNameEntry: (_playerID)=> {
            if (_playerID<0 || _playerID>3) return `Invalid player ID ${_playerID}`;
            vars.game.nameEntry.show(true, _playerID);
        },

        start: ()=> {
            vars.game.generatePlayers();
            vars.game.generateNewBoardAndScoreCard();            
        }
    },

    input: {
        cursors: null,
        locked: false,

        init: ()=> {
            vars.DEBUG ? console.log(`FN: input > init`) : null;

            scene.input.on('pointermove', (_pointer)=> {

            });
            scene.input.on('pointerdown', (_pointer)=> {
                
            });
            scene.input.on('pointerup', (_pointer)=> {
                
            });

            // mouse scroll (zoom in / out)
            scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ)=> {

            });

            // phaser objects
            scene.input.on('gameobjectdown', (pointer, gameObject)=> {
                //let name = gameObject.name;
            });
            scene.input.on('gameobjectup', (pointer, gameObject)=> {
                vars.input.click(gameObject);
            });

            scene.input.on('gameobjectover', (pointer, gameObject)=> {
                vars.input.over(gameObject);
            });

            scene.input.on('gameobjectout', (pointer, gameObject)=> {
                vars.input.out(gameObject);
            });
        },

        click: (_gameObject)=> {
            let name = _gameObject.name;

            if (name.startsWith('dot_')) {
                vars.game.board.clickDot(_gameObject);
                return;
            };

            if (name.startsWith('nameEntry_')) {
                vars.game.nameEntry.click(_gameObject);
                return;
            }
        },
        out: (_gameObject)=> {
            if (_gameObject.name.startsWith('dot_')) {
                game.canvas.style.cursor='default';
            };
        },
        over: (_gameObject)=> {
            if (_gameObject.name.startsWith('dot_')) {
                game.canvas.style.cursor='crosshair';
            };
        }
    },

    particles: {
        init: ()=> {
            vars.DEBUG ? console.log(`FN: particles > init`) : null;

            scene.particles = {}
        },

        generateBubbles: ()=> {
            let bubblesContainer = scene.containers.bubble =  scene.add.container().setName('bubblesContainer').setDepth(consts.depths.bubbles);
            bubblesContainer.bubblesTween = scene.tweens.addCounter({
                from: 0, to: 1, duration: 1000, repeat: -1,
                onRepeat: ()=> {
                    if (!bubblesContainer.visible) return;
                    let x = getRandom(5, consts.canvas.width/10-5)*10;
                    let y = getRandom(5, consts.canvas.height/10-5)*10;
                    let texture = getRandom(['dotConnectable','dotUsed','dotUnused']);
                    let bubble = scene.add.image(x,y,texture);
                    bubblesContainer.add(bubble);
                    let duration = getRandom(2,4)*1000;
                    let finalScale = getRandom(2,5);
                    scene.tweens.add({
                        targets: bubble, alpha: 0, scale: finalScale, duration: duration, onComplete: (_t,_o)=> { _o[0].destroy(); }
                    });
                }
            });

            bubblesContainer.show = (_show=true)=> {
                bubblesContainer.visible=_show;
                !_show && bubblesContainer.removeAll(true);
            };
        }
    },

    phaserObjects: {},

    shaders: {
        available: [],

        init: ()=> {
            vars.DEBUG ? console.log(`FN: shaders > init`) : null;

        }
    },

    UI: {

        init: ()=> {
            vars.DEBUG ? console.log(`FN: ui > init`) : null;

            vars.game.nameEntry = new NameEntry();
            vars.game.optionsScreen = new OptionsScreen();

            scene.tweens.addCounter({ from:0, to:1, useFrames: true, duration: 10, onComplete: ()=> { vars.UI.generateWinScreen(); }});

        },

        generateBackground: (_colour,_w=null, _h=null)=> {
            if (!vars.files.images.available.includes(_colour)) return false;

            let cC = consts.canvas;
            let width = _w||cC.width;
            let height = _h||cC.height;

            let bg = scene.add.image(width/2, height/2, _colour).setScale(width,height);
            return bg;
        },

        generateWinScreen() {
            vars.game.winScreen = new WinScreen();
        }
    }
};