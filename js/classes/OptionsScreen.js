let OptionsScreen = class {
    constructor() {
        this.players = vars.game.options.playersTotal;
        this.playersMin = 2; // used to limit the players
        this.playersMax = 4; // same here

        this.phaserObjects = {};

        this.initPlayerDots();
        this.initStartButton();

        scene.tweens.addCounter({ 
            from:0,to:1,useFrames:true,duration:10,
            onComplete: ()=> { vars.game.optionsScreen.initUI(); }
        });
    }

    initPlayerDots() {
        let thickness = 4;
        let lineColor = 0xffffff;
        let graphics = scene.add.graphics();
        for (let p=0; p<this.playersMax; p++) {
            let fillColor = vars.game.playerColours[p];
            graphics.lineStyle(thickness, lineColor);
            graphics.fillStyle(fillColor);

            let radius = 50;
            let c = new Phaser.Geom.Point(radius+thickness/2, radius+thickness/2);

            // empty dot
            graphics.strokeCircle(c.x, c.y, radius);
            graphics.fillCircle(c.x, c.y, radius);

            let d = radius*2+thickness;
            graphics.generateTexture(`p${p+1}_dot`,d,d);
            graphics.clear();
        };
        graphics.destroy();
    }
    initStartButton() {
        let buttonBG = scene.add.graphics();

        let width = 300; let height = 100;
        let buttonBGColours = { line: { size: 1, colour: 0x666666}, fill: { colour: 0xCCCCCC } };
        buttonBG.lineStyle(buttonBGColours.line.size,buttonBGColours.line.colour);
        buttonBG.fillStyle(buttonBGColours.fill.colour);
        buttonBG.fillRoundedRect(0,0, width, height, 20);
        buttonBG.strokeRoundedRect(0,0, width, height, 20);

        buttonBG.generateTexture('newGameButtonBG',width,height);
        buttonBG.clear().destroy();
    }
    initUI() {
        let cC = consts.canvas;
        let font = { ...vars.fonts.default, ...{ fontSize: '64px' } };
        let smallFont = { ...font, ...{ fontSize: '48px' } };

        let container = this.container = scene.add.container().setName('options');
        let bg = vars.UI.generateBackground('pixel3').setInteractive(); // interactive so that clicks wont pass through
        container.add(bg);

        let y =cC.height*0.15;
        let logo = scene.add.image(cC.cX,-100,'ui','gameLogo');
        scene.tweens.add({
            targets: logo, y: y, delay: 1500, duration: 2000, ease: 'Bounce'
        });
        container.add(logo);

        y = cC.height*0.3;
        let text = scene.add.text(cC.cX, y, 'PLAYERS', font).setOrigin(0.5);
        container.add(text);

        // left and right arrows
        y = cC.height*0.4;
        let options = vars.game.options;
        [cC.width*0.4,cC.width*0.6].forEach((_xpos,_i)=> {
            let arrow = scene.add.image(_xpos,y,'ui','arrowIcon').setInteractive();
            container.add(arrow);
            !_i && arrow.setAngle(180);
            arrow.on('pointerup', ()=> {
                if (!_i) {
                    options.playersTotal = clamp(options.playersTotal-1,this.playersMin,this.playersMax);
                } else {
                    options.playersTotal = clamp(options.playersTotal+1,this.playersMin,this.playersMax);
                };
                this.phaserObjects.playerCount.text = options.playersTotal;
                this.players = options.playersTotal;
                options.playerCurrent=1;
                this.updatePlayers();
                vars.localStorage.saveOptions();
            });
        });

        let playerCount = this.phaserObjects.playerCount = scene.add.text(cC.cX, y, options.playersTotal, font).setOrigin(0.5);
        container.add(playerCount);

        // add the 4 player buttons
        this.groups = {};
        y=cC.height*0.55;
        let xInc = 250;
        let startX = cC.cX-xInc*1.5;
        vars.game.playerNames.forEach((_n,_i)=> {
            let x = startX+_i*xInc;
            let icon = scene.add.image(x,y,`p${_i+1}_dot`).setScale(1.5).setInteractive();
            let c = icon.getCenter();
            icon.player = _i+1;
            icon.on('pointerup', ()=>{
                let playerID = icon.player-1;
                vars.game.nameEntry.show(true,playerID);
            });
            let text = this.phaserObjects[`p${_i+1}_name`] = scene.add.text(c.x, c.y, _n, smallFont).setOrigin(0.5);
            container.add([icon,text]);
            let group = this.groups[`p${_i+1}`] = scene.add.group().setName(`p${_i+1}`);
            group.addMultiple([icon,text]);
        });
        this.updatePlayers();


        // start button
        let startButton = scene.add.image(cC.cX,cC.height*0.8, 'newGameButtonBG').setInteractive();
        startButton.on('pointerup', ()=> {
            this.startGame();
        });
        let c = startButton.getCenter();
        let startText = scene.add.text(cC.cX,cC.height*0.8, 'START', font).setOrigin(0.5);
        container.add([startButton,startText]);

        
    }

    show(_show=true) {
        this.container.setVisible(_show);
    }

    startGame() {
        this.show(false);
        vars.game.start();
    }

    updatePlayerName(_playerID) {
        let name = vars.game.playerNames[_playerID-1];
        this.phaserObjects[`p${_playerID}_name`].text = name;
    }

    updatePlayers() {
        for (let p=1; p<=this.playersMax; p++) {
            let alpha = p<=this.players ? 1 : 0.25;
            this.groups[`p${p}`].getChildren().forEach((_c)=>{ _c.alpha=alpha; });
        };
    }
};