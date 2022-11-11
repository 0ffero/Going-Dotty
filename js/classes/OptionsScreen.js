let OptionsScreen = class {
    constructor() {
        this.players = vars.game.options.playersTotal;
        this.playersMin = 2; // used to limit the players
        this.playersMax = 4; // same here
        this.dotRadius = 8;

        this.phaserObjects = {};

        this.initPlayerDots();
        this.initStartButton();

        scene.tweens.addCounter({ 
            from:0,to:1,useFrames:true,duration:10,
            onComplete: ()=> { vars.game.optionsScreen.initUI(); }
        });
    }
    initDevBounce() {
        let cC = consts.canvas;
        
        let sX = cC.width;
        let eX = cC.width*0.833;
        let sY = cC.height*0.75;
        let eY = cC.height*0.95;
        
        let short = 1500;
        let long = 2000;
        
        let easeX = 'Quad';
        let easeY = 'Bounce';
        
        let delay = 4000;
        let delayInc = 750;
        let a = scene.add.text(sX, sY, 'OFFER0',vars.fonts.default).setAlpha(0);
        a.tweenX = scene.tweens.add({ targets: a, delay: delay, alpha: 1, x: eX, duration: short, ease: easeX });
        a.tweenY = scene.tweens.add({ targets: a, delay: delay, y: eY, duration: long, ease: easeY });

        delay+=delayInc;
        let b = scene.add.text(sX,sY, 'OCT',vars.fonts.default).setAlpha(0);
        b.tweenX = scene.tweens.add({ targets: b, delay: delay, alpha: 1, x: eX+175, duration: short, ease: easeX });
        b.tweenY = scene.tweens.add({ targets: b, delay: delay, y: eY, duration: long, ease: easeY });

        delay+=delayInc;
        let c = scene.add.text(sX,sY, '2022',vars.fonts.default).setAlpha(0);
        c.tweenX = scene.tweens.add({ targets: c, delay: delay, alpha: 1, x: eX+275, duration: short, ease: easeX });
        c.tweenY = scene.tweens.add({ targets: c, delay: delay, y: eY, duration: long, ease: easeY });

        this.container.add([a,b,c]);
    }
    initPlayerDots() {
        let thickness = 4;
        let lineColor = 0xffffff;
        let graphics = scene.add.graphics();
        for (let p=0; p<this.playersMax+1; p++) {
            let fillColor = vars.game.playerColours[p];
            p===4 && (lineColor = 0x0);
            graphics.lineStyle(thickness, lineColor);
            graphics.fillStyle(fillColor);

            let radius = 50;
            let c = new Phaser.Geom.Point(radius+thickness/2, radius+thickness/2);

            // empty dot
            graphics.strokeCircle(c.x, c.y, radius);
            graphics.fillCircle(c.x, c.y, radius);

            let d = radius*2+thickness;
            let key = p<4 ? `p${p+1}_dot` : 'pDotShadow';
            graphics.generateTexture(key,d,d);
            graphics.clear();
        };
        graphics.destroy();
    }
    initStartButton() {
        let buttonBG = scene.add.graphics();

        let width = 300; let height = 100;
        let buttonBGColours = { line: { size: 1, colour: 0x666666}, fill: { colour: 0x999999 } };
        [0,1].forEach((_i)=>{
            _i && (buttonBGColours = { line: { size: 1, colour: 0}, fill: { colour: 0 } });
            buttonBG.lineStyle(buttonBGColours.line.size,buttonBGColours.line.colour);
            buttonBG.fillStyle(buttonBGColours.fill.colour);
            buttonBG.fillRoundedRect(0,0, width, height, 20);
            buttonBG.strokeRoundedRect(0,0, width, height, 20);
    
            let key = !_i ? 'newGameButtonBG' : 'newGameButtonBGShadow';
            buttonBG.generateTexture(key,width,height);
            buttonBG.clear();
        });
        buttonBG.destroy()
    }
    initUI() {
        let cC = consts.canvas;
        let font = { ...vars.fonts.default, ...{ fontSize: '42px', strokeThickness: 4 } };
        let headingFont = { ...vars.fonts.default, ...{ fontSize: '72px', strokeThickness: 6 } };
        let optionsFont = { ...vars.fonts.default, ...{ fontSize: '64px', strokeThickness: 5 } };

        let smallFont = { ...font, ...{ fontSize: '32px' } };
        let versionFont = { ...smallFont, ...{ fontSize: '24px' } };

        let container = this.container = scene.add.container().setName('options');
        
        let y =cC.height*0.15;
        let logo = scene.add.image(cC.cX,-100,'ui','gameLogo');
        scene.tweens.add({
            targets: logo, y: y, delay: 250, duration: 2000, ease: 'Bounce',
            onComplete: ()=> {
                let bottomRight = logo.getBottomRight();
                let version = scene.add.text(bottomRight.x-300, bottomRight.y+20, `Version ${vars.version}`, versionFont).setOrigin(1,0).setAlpha(0);
                container.add(version);
                scene.tweens.add({ targets: version, alpha: 0.8, x: bottomRight.x+20, duration: 3000, ease: 'Quad' });
            }
        });
        container.add(logo);

        // PLAYERS
        y = cC.height*0.3;
        let text = scene.add.text(cC.cX, y, 'PLAYERS', headingFont).setOrigin(0.5);
        text.font = headingFont;
        let textShadow = vars.UI.generateTextShadow(text);
        container.add([textShadow,text]);

        // left and right arrows
        y = cC.height*0.4;
        let options = vars.game.options;
        [cC.width*0.4,cC.width*0.6].forEach((_xpos,_i)=> {
            let arrow = scene.add.image(_xpos,y,'ui','arrowIcon').setInteractive();
            container.add(arrow);
            !_i && arrow.setAngle(180);
            arrow.on('pointerup', ()=> {
                vars.audio.playButtonClick();

                if (arrow.tween) { arrow.tween.remove(); arrow.tween=null; arrow.scale=1; }
                arrow.tween = scene.tweens.add({
                    targets: arrow, scale: 0.9, useFrames: true, duration: 5, yoyo: true, onComplete: (_t,_o)=> { _o[0].tween = null }
                });

                if (!_i) {
                    options.playersTotal = clamp(options.playersTotal-1,this.playersMin,this.playersMax);
                } else {
                    options.playersTotal = clamp(options.playersTotal+1,this.playersMin,this.playersMax);
                };
                this.phaserObjects.playerCount.text = options.playersTotal;
                this.phaserObjects.playerCountShadow.text = options.playersTotal;
                this.players = options.playersTotal;
                options.playerCurrent=1;
                this.updatePlayers();
                vars.localStorage.saveOptions();
            });
        });

        let playerCount = this.phaserObjects.playerCount = scene.add.text(cC.cX, y, options.playersTotal, optionsFont).setOrigin(0.5);
        playerCount.font = optionsFont;
        let playerCountShadow = this.phaserObjects.playerCountShadow = vars.UI.generateTextShadow(playerCount);
        container.add([playerCountShadow,playerCount]);

        // add the 4 player buttons
        this.groups = {};
        y=cC.height*0.55;
        let hoverText = this.phaserObjects.hoverText = scene.add.text(0,y-120,`Change player N'S name`,smallFont).setOrigin(0.5).setVisible(false);
        this.container.add(hoverText);
        let xInc = 250;
        let startX = cC.cX-xInc*1.5;
        vars.game.playerNames.forEach((_n,_i)=> {
            let x = startX+_i*xInc;
            let pInt = _i+1;
            let icon = scene.add.image(x,y,`p${_i+1}_dot`).setScale(1.5).setName(`nameDot_p${pInt}`).setInteractive();
            let iconShadow = scene.add.image(x+16,y+16,'pDotShadow').setAlpha(0.2).setScale(1.5).setName('iS');
            icon.player = pInt;
            let c = icon.getCenter();
            icon.on('pointerup', ()=>{
                vars.audio.playButtonClick();
                let playerID = icon.player-1;
                vars.game.nameEntry.show(true,playerID);
            });
            let text = this.phaserObjects[`p${_i+1}_name`] = scene.add.text(c.x, c.y, _n, font).setOrigin(0.5);
            container.add([iconShadow,icon,text]);
            let group = this.groups[`p${_i+1}`] = scene.add.group().setName(`p${_i+1}`);
            group.addMultiple([iconShadow,icon,text]);
        });
        this.updatePlayers();


        // BOARD SIZE
        y = cC.height*0.7;
        let bStext = scene.add.text(cC.cX, y, 'BOARD SIZE', headingFont).setOrigin(0.5);
        bStext.font = headingFont;
        let bStextShadow = vars.UI.generateTextShadow(bStext);
        container.add([bStextShadow,bStext]);

        y = cC.height*0.8;
        let boxesW = options.difficultySettings[options.difficulty];
        let cDiff = this.phaserObjects.currentDifficulty = scene.add.text(cC.cX, y, `${boxesW}x${boxesW} (${boxesW*boxesW} Boxes)`, optionsFont).setOrigin(0.5);
        cDiff.font = optionsFont;
        let cDiffShadow = this.phaserObjects.currentDifficultyShadow = vars.UI.generateTextShadow(cDiff);
        container.add([cDiffShadow, cDiff]);

        // left and right arrows
        [cC.width*0.325,cC.width*0.675].forEach((_xpos,_i)=> {
            let arrow = scene.add.image(_xpos,y,'ui','arrowIcon').setInteractive();
            container.add(arrow);
            !_i && arrow.setAngle(180);
            arrow.on('pointerup', ()=> {
                vars.audio.playButtonClick();

                if (arrow.tween) { arrow.tween.remove(); arrow.tween=null; arrow.scale=1; }
                arrow.tween = scene.tweens.add({
                    targets: arrow, scale: 0.9, useFrames: true, duration: 5, yoyo: true, onComplete: (_t,_o)=> { _o[0].tween = null }
                });

                if (!_i) {
                    options.difficulty = clamp(options.difficulty-1,0,3);
                } else {
                    options.difficulty = clamp(options.difficulty+1,0,3);
                };
                let boxesW = options.difficultySettings[options.difficulty];
                this.phaserObjects.currentDifficulty.text = `${boxesW}x${boxesW} (${boxesW*boxesW} Boxes)`;
                this.phaserObjects.currentDifficultyShadow.text = `${boxesW}x${boxesW} (${boxesW*boxesW} Boxes)`;
                this.difficulty = options.difficulty;
                vars.localStorage.saveOptions();
            });
        });


        // start button
        y = cC.height*0.95;
        let startButton = scene.add.image(cC.cX,y, 'newGameButtonBG').setInteractive();
        let startButtonShadow = scene.add.image(cC.cX+8,y+8, 'newGameButtonBGShadow').setAlpha(0.2);
        startButton.on('pointerup', ()=> {
            vars.audio.playButtonClick();
            scene.tweens.add({
                targets: this.groups.startButton.getChildren(),
                scale: 0.9, useFrames: true, duration: 5, yoyo: true, ease: 'Quad',
                onComplete: ()=> { this.startGame(); }
            });
        });
        let startText = scene.add.text(cC.cX,y, 'START', font).setOrigin(0.5);
        this.groups.startButton = scene.add.group().setName('startButton');
        this.groups.startButton.addMultiple([startButtonShadow,startButton,startText]);
        container.add([startButtonShadow,startButton,startText]);

        this.initDevBounce();

        vars.particles.generateBubbles();
    }

    show(_show=true) {
        this.container.setVisible(_show);
        scene.containers.bubble.show(_show);
    }

    showHoverText(_show=true,_p='',_x=0) {
        let hT = this.phaserObjects.hoverText;
        _show && (hT.text=`CHANGE PLAYER ${_p}'S NAME`);
        hT.setVisible(_show);
        hT.x=_x;
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
            let alpha = p<=this.players ? 1 : 0.1;
            this.groups[`p${p}`].getChildren().forEach((_c)=>{ _c.name!=='iS' && _c.setAlpha(alpha); if (_c.name==='iS') { alpha!==1 ? _c.setVisible(false) : _c.setVisible(true); }; }); 
        };
    }
};