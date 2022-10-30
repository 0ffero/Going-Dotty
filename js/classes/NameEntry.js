let NameEntry = class {
    constructor() {

        this.initButtonBackground();

        this.phaserObjects = {};

        // wait for the bg to be made into a texture then init the UI 
        // (takes 1 frame, but using 10 for safety in case of dropped frames)
        scene.tweens.addCounter({ from:0,to:1,useFrames:true,duration:10, onComplete: ()=> { vars.game.nameEntry.initUI(); }})

    }

    initButtonBackground() {
        let buttonBG = scene.add.graphics();

        let width = 100; let height = 100;
        this.buttonBGColours = { line: { size: 1, colour: 0x333333}, fill: { colour: 0xCCCCCC } };
        buttonBG.lineStyle(this.buttonBGColours.line.size,this.buttonBGColours.line.colour);
        buttonBG.fillStyle(this.buttonBGColours.fill.colour);
        buttonBG.fillRoundedRect(0,0, width, height, 20);
        buttonBG.strokeRoundedRect(0,0, width, height, 20);

        buttonBG.generateTexture('buttonBG',width,height);
        buttonBG.clear().destroy();
    }
    initUI() {
        let font = { ...vars.fonts.default, ...{ fontSize: '64px' } };
        this.container = scene.add.container().setName('nameEntry').setDepth(consts.depths.nameEntry);

        let bg = this.phaserObjects.bg = vars.UI.generateBackground('pixel3');
        this.container.add(bg);
        let y = 0; let spacing = 150; let maxButtonsPerLine = 10;
        let x;
        for (let a=0; a<=25; a++) {
            x = a%maxButtonsPerLine*spacing;
            let l = String.fromCharCode(a+65);
            let buttonBG = scene.add.image(x,y,'buttonBG').setOrigin(0).setName(`nameEntry_${l}`).setInteractive();
            buttonBG.letter = l;
            let c = buttonBG.getCenter();
            let letter = scene.add.text(c.x,c.y, l, font).setOrigin(0.5);
            this.container.add([buttonBG,letter]);

            (a && a%maxButtonsPerLine===maxButtonsPerLine-1) && (y+=spacing);
        };

        let a = 26;
        ['.','-','*',' '].forEach((_c)=> {
            x = a%maxButtonsPerLine*spacing;
            let buttonBG = scene.add.image(x,y,'buttonBG').setOrigin(0).setName(`nameEntry_${_c}`).setInteractive();
            buttonBG.letter = _c;
            let c = buttonBG.getCenter();
            let letter = scene.add.text(c.x,c.y, _c, font).setOrigin(0.5);
            this.container.add([buttonBG,letter]);
            a++;
        });

        y+=spacing;
        for (let a=0; a<10; a++) {
            let buttonBG = scene.add.image(a*spacing,y,'buttonBG').setOrigin(0).setName(`nameEntry_${a.toString()}`).setInteractive();
            buttonBG.letter = a.toString();
            let c = buttonBG.getCenter();
            let letter = scene.add.text(c.x,c.y, a, font).setOrigin(0.5);
            this.container.add([buttonBG,letter]);
        };

        y+=spacing*1.5;
        let scale = 2.1;
        let startX = 325; let xInc = 300;
        let positions = [];
        for (let p=0; p<3; p++) { positions.push(startX+p*xInc); };
        positions.forEach((_pos,_i)=> {
            let buttonBG = scene.add.image(_pos,y,'buttonBG').setOrigin(0).setScale(scale);
            buttonBG.letter = _i;
            let c = buttonBG.getCenter();
            let letter = this.phaserObjects[`letter_${_i}`] = scene.add.text(c.x,c.y, '', font).setOrigin(0.5).setScale(scale);
            this.container.add([buttonBG,letter]);
        });

        // add the delete and enter buttons
        y+=spacing*2;
        positions = [500, 800];
        ['«','»'].forEach((_b,_i)=> {
            let buttonBG = scene.add.image(positions[_i],y,'buttonBG').setOrigin(0).setName(`nameEntry_${a.toString()}`).setInteractive();
            buttonBG.letter = !_i ? 'delete' : 'enter';
            let c = buttonBG.getCenter();
            let letter = scene.add.text(c.x,c.y, _b, font).setOrigin(0.5);
            this.container.add([buttonBG,letter]);
        });

        this.positionContainer({ x: positions[0], y: 200 });

        this.show(false);
    }

    acceptName() {
        vars.game.playerNames[this.playerID] = this.name;
        vars.localStorage.saveOptions();
        // update the options screen
        vars.game.optionsScreen.updatePlayerName(this.playerID+1);
        // hide name entry
        this.show(false);
    }
    deleteLetter() {
        this.name = this.name.substring(0,this.name.length-1);
        this.phaserObjects[`letter_${this.name.length}`].text='';
    }

    click(_gameObject) {
        let letter = _gameObject.letter;

        if (letter==='delete' || letter === 'enter') {
            switch (letter) {
                case 'delete':
                    this.deleteLetter();
                    return;
                break;

                case 'enter':
                    this.acceptName();
                    return;
                break;
            };
        };


        console.log(`Adding letter ${letter}`);
        this.name = this.name.substring(0,2); // this line limits entry to 3 chars (updating the last char if player clicks on other chars)
        this.name+=letter;

        this.phaserObjects[`letter_${this.name.length-1}`].text = letter;
    }

    positionContainer(_pos) {
        this.container.setPosition(_pos.x,_pos.y);
        this.phaserObjects.bg.x-=_pos.x/2;
        this.phaserObjects.bg.y-=_pos.y/2;
    }

    show(_show=true, _playerID=null) {
        if (_show && _playerID===null) return 'When showing the Name Entry screen a player ID MUST be passed in';

        // if we're showing the name entry screen
        // fill in the current letters
        // if this name is a default the entries will be empty
        let letters;
        if (_show) {
            if (_playerID<0 || _playerID>3) return 'The player ID MUST be between 0 and 3'
            let name = vars.game.playerNames[_playerID];
            if (!name) return `Name for player ${_playerID} not found!`;
            this.playerID = _playerID; // needed when saving the new name

            name.length>3 && (name = name.substring(0,3)); // make sure the name has no more than 3 characters

            let defaultNames = ['P1','P2','P3','P4'];
            if (defaultNames.includes(name)) {
                this.name='';
                letters = [' ',' ',' '];
            } else {
                this.name = name;
                letters = name.split('');
            };
            
            let pO = this.phaserObjects;
            letters.forEach((_l,_i)=> {
                pO[`letter_${_i}`].text = _l;
            });
        };

        this.container.setVisible(_show);
    }
};