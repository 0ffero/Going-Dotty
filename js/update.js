var update = ()=> {
    if (vars.game.winScreen && vars.game.winScreen.container.visible) {
        vars.game.winScreen.fireworks.update();
    };
}