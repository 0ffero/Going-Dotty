vars.DEBUG && console.log('Initialising...');

var config = {
    title: vars.name,
    type: Phaser.CANVAS,
    version: vars.version,

    backgroundColor: '#111111',
    disableContextMenu: true,

    height: consts.canvas.height,
    width: consts.canvas.width,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: consts.canvas.width,
        height: consts.canvas.height,
    },

    scene: {
        preload: preload,
        create: create,
        pack: {
            files: [
                { type: 'image', key: 'loadingScreen', url: 'assets/images/loadingScreen.png' }
            ]
        }
    }
};

var game = new Phaser.Game(config);
var clamp = Phaser.Math.Clamp;

/*
█████ ████  █████ █      ███  █████ ████  
█   █ █   █ █     █     █   █ █   █ █   █ 
█████ ████  ████  █     █   █ █████ █   █ 
█     █   █ █     █     █   █ █   █ █   █ 
█     █   █ █████ █████  ███  █   █ ████  
*/
function preload() {
    scene = this;

    let cC = consts.canvas;
    scene.add.image(cC.cX, cC.cY,'loadingScreen').setName('loadingScreen').setDepth(consts.depths.loadingScreen);

    vars.init('PRELOAD');
}



/*
█████ ████  █████ █████ █████ █████ 
█     █   █ █     █   █   █   █     
█     ████  ████  █████   █   ████  
█     █   █ █     █   █   █   █     
█████ █   █ █████ █   █   █   █████ 
*/
function create() {
    vars.init('CREATE'); // build the phaser objects, scenes etc
    vars.init('STARTAPP'); // start the app

    let loadingScreen = scene.children.getByName('loadingScreen');
    scene.tweens.add({
        targets: loadingScreen,
        alpha: 0,
        delay: 1000,
        duration: 500,
        onComplete: (_t,_o)=> {
            _o[0].destroy();
        }
    })
}