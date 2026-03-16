// define all UI elements
let marginSpacing = 10;
let curColors;
let motorMenu;
let motorOneMenu;
let mouseBounds;

let allMotorVariables = [];

function initializeUI(){
    curColors = new colorScheme(100, 60, 200, 120);
    mouseBounds = new bounds(mouseX - 1, mouseY - 1, 2, 2);
    motorMenu = new menu(new bounds(0, 0, width/5, height), "Motors");
    motorMenu.addElement(new tabScrollBar(new bounds(marginSpacing, marginSpacing, (width/5) - (marginSpacing*2), height / 10)));
    motorOneMenu = constructMotorMenu();
    motorMenu.addTab(motorOneMenu);
}

function constructMotorMenu(){
    let newMotorMenu = new menu(new bounds(marginSpacing, (marginSpacing*2) + (height/10), (width/5) - (marginSpacing*2), height - ((marginSpacing*3) + (height/10))));

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
    addPosition(x, y){
        this.setPosition(this.x + x, this.y + y);
    }
    addSize(w, h){
        this.setSize(this.w + w, this.h + h);
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
    isCompletelyWithin(bounds){
        return (bounds.x < this.x && bounds.maxX > this.maxX && bounds.y < this.y && bounds.maxY > this.maxY);
    }
    isPartiallyWithin(bounds){
        return (!(bounds.x > this.maxX || bounds.maxX < this.x) && !(bounds.y > this.maxY || bounds.maxY < this.y));
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
        this.boundElements = [];
        this.allEllements.push(this);
    }
    show(){
        this.isVisible = true;
        for(let e of this.boundElements){
            e.show();
        }
    }
    hide(){
        this.isVisible = false;
        for(let e of this.boundElements){
            e.hide();
        }
    }
    bindToBounds(bounds){
        bounds.addFollower(this.bounds);
    }
    bindToElement(element){
        element.bounds.addFollower(this.bounds);
        element.boundElements.push(this);
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
        this.show();
        return newAnimation;
    }        
    draw(){
        if(this.currentAnimation != undefined){
            this.currentAnimation.runAnimation();
            if(this.currentAnimation.isFinished) {
                this.currentAnimation = undefined;
                if(this.bounds.w == 0 || this.bounds.h == 0) this.hide();
                else this.show();
            }
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
    addElement(element){
        element.bindToElement(this);
        this.elements.push(element);
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

class checkbox extends element{
    constructor(bounds){
        super(bounds)
        this.bounds = bounds;
        this.buttonHTML = createButton("[ ]")
        this.isSelected = false;
        this.buttonHTML.mousePressed(this.toggle);
    }
    toggle(){
        this.isSelected = !this.isSelected;
        if(this.isSelected) this.buttonHTML.html('[X]');
        else this.buttonHTML.html('[ ]');
    }
    getValue(){
        return this.isSelected;
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

class lable extends element{
    constructor(bounds, lable){
        super(bounds);
        this.bounds = bounds;
        this.lable = lable;
    }
    draw(){
        super.draw();
        fill(curColors.primary);
        stroke(curColors.outline);
        rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
        fill(curColors.contrast);
        textAlign(LEFT);
        text(this.lable, this.bounds.x + marginSpacing, this.bounds.y + this.bounds.h/2 + marginSpacing);
    }
}

class scrollingList extends element{
    constructor(bounds, elements=[]){
        this.bounds = bounds;
        this.elements = elements;
        for(let e of this.elements){
            e.bindToElement(this);
        }
        this.scrollPosition = 0; // 0 -> 1
        this.scrollBarLength = this.bounds.h - (marginSpacing*2);
        this.scrollBarBounds = new bounds(
            this.bounds.maxX - marginSpacing - 30,
            this.bounds.y + marginSpacing + ((this.bounds.h-this.scrollBarLength)*scrollPosition),
            30,
            this.bounds.h - (marginSpacing*2));
        this.scrollBarOutline = this.scrollBarBounds.copyDimensions()
        this.scrollBarOutline.addPosition(-marginSpacing/2, -marginSpacing/2);
        this.scrollBarOutline.addSize(marginSpacing, marginSpacing);
    }
    addElement(element){
        element.bounds.setPosition(this.bounds.x + marginSpacing, this.bounds.y + ((marginSpacing+40)*this.elements.length));
        element.bounds.setSize(this.bounds.w - marginSpacing*2, 40);
        this.elements.push(element);
        element.bindToElement(this);
    }
    draw(){
        super.draw();
        fill(curColors.primary);
        stroke(curColors.outline);
        rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);

        // draw scroll bar

        let totalElementListHeight = this.elements.length * (marginSpacing + 40);

        // position y from 0 to height - bar height is mapped to a range of 0 to the total height of all elements - bounds.height
        if(totalElementListHeight > this.bounds.h){
            fill(curColors.secondary);
            rect(this.scrollBarOutline.x, this.scrollBarOutline.y, this.scrollBarOutline.w, this.scrollBarOutline.h);
            fill(curColors.contrast);
            rect(this.scrollBarBounds.x, this.scrollBarBounds.y, this.scrollBarBounds.w, this.scrollBarBounds.h);
        }
    }
}

class tabScrollBar extends element{
    constructor(bounds, tabs=[]){
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