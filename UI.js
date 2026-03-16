// define all UI elements
let marginSpacing = 10;
let curColors;

function initializeUI(){
    curColors = new colorScheme(100, 60, 200, 120);
}

class colorScheme{
    constructor(primary, secondary, contrast, outline){
        this.primary = primary;
        this.secondary = secondary;
        this.contrast = contrast;
        this.outline = outline;
    }
}

class bounds{
    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.maxX = this.x + this.w;
        this.maxY = this.y + this.h;
        this.followers = [];
        this.follower = undefined;
    }
    setPosition(x, y){
        this.x = x;
        this.y = y;
        for(let follower of this.followers){
            follower.updateRelativePosition(x, y);
        }
        this.maxX = this.x + this.w;
        this.maxY = this.y + this.h;    
    }
    setSize(w, h){
        for(let follower of this.followers){
            follower.updateRelativeSize(w, h);
        }
        this.w = w;
        this.h = h;
        this.maxX = this.x + this.w;
        this.maxY = this.y + this.h;
    }
    addFollower(bounds){
        this.followers.push(new boundsFollower(bounds, this));
    }
    createFollower(offsetX, offsetY, w, h){
        let newBounds = new bounds(this.x + offsetX, this.y + offsetY, w, h);
        this.addFollower(newBounds);
        return newBounds;
    }
    copyDimensions(){
        return new bounds(this.x, this.y, this.w, this.h);
    }
}

class boundsFollower{
    constructor(bounds, boundsToFollow){
        this.bounds = bounds;
        this.boundsToFollow = boundsToFollow;
        this.offsetX = this.bounds.x - this.boundsToFollow.x;
        this.offsetY = this.bounds.y - this.boundsToFollow.y;
        this.bounds.follower = this;
    }
    updateRelativeSize(newW, newH){
        this.wScale = newW / this.boundsToFollow.w;
        this.hScale = newH / this.boundsToFollow.h;
        this.bounds.w *= this.wScale;
        this.bounds.h *= this.hScale;
        this.offsetX *= this.wScale;
        this.offsetY *= this.hScale;
        this.bounds.x = this.boundsToFollow.x + this.offsetX;
        this.bounds.y = this.boundsToFollow.y + this.offsetY;
    }
    updateRelativePosition(newX, newY){
        this.bounds.x = newX + this.offsetX;
        this.bounds.y = newY + this.offsetY;
    }
}

class boundsAnimation{
    static linear;

    constructor(bounds, targetBounds, durationSeconds, easing){
        this.bounds = bounds;
        this.targetBounds = targetBounds;
        this.durationFrames = durationSeconds*60;
        this.easing = easing;
        this.isFinished = false;
    }
    runAnimation(){
        switch(this.easing){
            case linear:
                let newX = (this.targetBounds.x - this.bounds.x)/this.duration;
                let newY = (this.targetBounds.y - this.bounds.y)/this.duration;
                
                let newW = (this.targetBounds.w - this.bounds.w)/this.duration;
                let newH = (this.targetBounds.h - this.bounds.h)/this.duration;
                
                this.bounds.setPosition(newX, newY);
                this.bounds.setSize(newW, newH);
                break;
        }
        if(abs(this.targetBounds.x - this.bounds.y)+abs(this.targetBounds.x - this.bounds.y)+abs(this.targetBounds.w - this.bounds.w)+abs(this.targetBounds.h - this.bounds.h) < 5){
            this.bounds.setPosition(this.targetBounds.x, this.targetBounds.y);
            this.bounds.setSize(this.targetBounds.w, this.targetBounds.h);
            this.isFinished = true;
        }
    }
}

class element{
    static left;
    static right;
    static up;
    static down;
    static allEllements = [];

    constructor(bounds){
        this.extendedBounds = bounds;
        this.bounds = bounds;
        this.isVisible = true;
        this.currentAnimation = undefined;
        this.allEllements.push(this);
    }
    show(){
        this.isVisible = true;
    }
    hide(){
        this.isVisible = false;
    }
    bindToBounds(bounds){
        bounds.addFollower(this.bounds);
    }
    minmize(direction){
        this.extendedBounds = this.bounds;
        let targetBounds = this.bounds.copyDimensions;
        switch(direction){
            case left:
                targetBounds.w = 0;
                break;
            case right:
                targetBounds.w = 0;
                targetBounds.x = this.bounds.maxX;
                break;
            case up:
                targetBounds.h = 0;
                break;
            case down:
                targetBounds.h = 0;
                targetBounds.y = this.bounds.maxY;
                break;
        }
        let newAnimation = new boundsAnimation(this.bounds, targetBounds, 0.5, boundsAnimation.linear);
        this.currentAnimation = newAnimation;
        return newAnimation;
    }
    maximize(){
        let targetBounds = this.extendedBounds.copyDimensions;
        let newAnimation = new boundsAnimation(this.bounds, targetBounds, 0.5, boundsAnimation.linear);
        this.currentAnimation = newAnimation;
        return newAnimation;
    }        
    draw(){
        if(this.currentAnimation != undefined){
            this.currentAnimation.runAnimation();
            if(this.currentAnimation.isFinished) this.currentAnimation = undefined;
        }
    }
    static updateAllElements(){
        for(e in this.allEllements){
            if(e.isVisible) e.draw();
        }
    }
}

class menu extends element{
    constructor(bounds, lable){
        super(bounds);
        this.elements = [];
        this.lable = lable;
    }
    drawSelf(){
        super.draw();
        fill(curColors.primary);
        stroke(curColors.outline);
        rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
    }
}

class button extends element{
    constructor(bounds, lable){
        super(bounds);
        this.lable = lable;
        this.buttonHTML = createButton(lable);
        this.buttonHTML.position(this.bounds.x, this.bounds.y);
        this.buttonHTML.size(this.bounds.w, this.bounds.h);
    }
    onPress(callback){
        this.buttonHTML.mousePressed(callback);
    }
    draw(){
        super.draw();
        this.buttonHTML.position(this.bounds.x, this.bounds.y);
        this.buttonHTML.size(this.bounds.w, this.bounds.h);
    }
    show(){
        super.show();
        this.buttonHTML.show();
    }
    hide(){
        super.hide();
        this.buttonHTML.hide();
    }
}

class tabScrollBar extends element{
    constructor(bounds, tabs){
        super(bounds);
        this.tabs = tabs;
        this.buttons = [];
        this.currentTab = 0;
        for(let t of this.tabs){
            this.addButton(t.lable);
        }
    }
    addTab(menu){
        let newWidth = ((this.bounds.w - (marginSpacing*(this.buttons.length+1))) / (this.buttons.length + 1));
        for(let i = 0; i < this.buttons.length; i++){
            this.buttons[i].bounds.w = newWidth;
            this.buttons[i].follower.offsetX =((i+1)*marginSpacing) + (i*newWidth);
        }

        let newButton = new button(tabName, this.bounds.createFollower((this.buttons.length*marginSpacing) + (this.buttons.length*newWidth), marginSpacing, newWidth, this.bounds.h - marginSpacing*2));
        newButton.onPress(()=> this.currentTab = this.tabs.length); // not .length -1 because the new tab hasnt been pushed to the array yet
        this.buttons.push()

        this.tabs.push(menu);
    }
    setCurrentTab(index){
        if(index < 0 || index > this.tabs.length){console.error("Index Out Of Bounds In Set Current Tab"); return;}
        this.tabs[this.currentTab].hide();
        this.currentTab = index;
        this.tabs[this.currentTab].show();
    }
    draw(){
        super.draw();
        fill(curColors.primary);
        stroke(curColors.outline);
        rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
    }
}