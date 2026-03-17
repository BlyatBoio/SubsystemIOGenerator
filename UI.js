// define all UI elements
let marginSpacing = 10;
let curColors;

let motorMenu;
let motorScrollBar

let mouseBounds;

let addMotorButton;
let addMotorMenu;
let submitMotorButton;
let motorNameBox;

let subsystemTitleInput;

let allMotorVariables = ["Position","Velocity","PositionClosedLoopError","VelocityClosedLoopError","SupplyCurrent","Connected","Temperature"];
let numMotors = 0;

let constantsMenu;
let constantList;

let addConstantButton;
let addConstantMenu;
let submitConstantButton;
let constantNameBox;
let constantValueBox;

function initializeUI(){
    //global values
    curColors = new colorScheme(50, 60, 200, 120);
    mouseBounds = new bounds(mouseX - 1, mouseY - 1, 2, 2);

    // define constant menu elements
    constantsMenu = new menu(new bounds(width - width/5, 0, width/5, height), "Constants");
    constantList = new scrollingList(constantsMenu.bounds.copyDimensions().addPosition(marginSpacing, height/8).addSize(-marginSpacing*2, -((height/8)+marginSpacing)), [], scrollingList.scrollVertical);
    
    constantsMenu.addElement(constantList);
    // define add constant menu
    addConstantMenu = new menu(new bounds(width/2-width/10, height/2-height/10, width/5, height/5));
    submitConstantButton = new button(new bounds(width/2 - width/40, height/2 + height/10 + marginSpacing, width/20, height/20), "Add Constant");
    addConstantButton = new button(new bounds(width - width/5 + marginSpacing, marginSpacing, 90, 40), "Add Constant");
    constantNameBox = new textArea(addConstantMenu.bounds.copyDimensions().addSize(-width/30, -height/8).addPosition(width/60, marginSpacing));
    constantValueBox = new textArea(addConstantMenu.bounds.copyDimensions().addSize(-width/30, -height/8).addPosition(width/60, marginSpacing*2 + height/12));
    
    constantNameBox.textInput.style('text-align', 'center');
    constantNameBox.textInput.style('font-size', '20px');
    constantNameBox.textInput.value("Name");

    constantValueBox.textInput.style('text-align', 'center');
    constantValueBox.textInput.style('font-size', '20px');
    constantValueBox.textInput.value("Value");

    // bind button actions
    submitConstantButton.onPress(()=> {
        let newMenu = new menu(new bounds(0, 0, 120, 60), "");
        let nameArea = new textArea(new bounds(10, 10, 50, 30));
        let valueArea = new textArea(new bounds(60, 10, 50, 30));

        nameArea.textInput.value(constantNameBox.textInput.value());
        valueArea.textInput.value(constantValueBox.textInput.value());

        newMenu.addElement(nameArea);
        newMenu.addElement(valueArea);

        constantList.addElement(newMenu);
        console.log(constantsMenu);
        addConstantMenu.hide();
    });
    addConstantButton.onPress(() => addConstantMenu.show());

    // add all elements
    addConstantMenu.addElement(submitConstantButton);
    addConstantMenu.addElement(constantNameBox);
    addConstantMenu.addElement(constantValueBox);
    addConstantMenu.hide();

    // define motor menu elements
    motorMenu = new menu(new bounds(0, 0, width/5, height), "Motors");
    motorScrollBar = new tabScrollBar(new bounds(marginSpacing, marginSpacing + 50, (width/5) - (marginSpacing*2), 40 + marginSpacing*2));

    // add filler motor tab
    motorScrollBar.addTab(constructMotorMenu("Example"));

    // add main elements to menu
    motorMenu.addElement(motorScrollBar);

    // define add motor menu
    addMotorMenu = new menu(new bounds(width/2-width/10, height/2-height/10, width/5, height/5));
    submitMotorButton = new button(new bounds(width/2 - width/40, height/2 + height/10, width/20, height/20), "Add Motor");
    addMotorButton = new button(new bounds(width/5 - (90+marginSpacing), marginSpacing, 90, 40), "Add Motor");
    motorNameBox = new textArea(addMotorMenu.bounds.copyDimensions().addSize(-width/30, -width/30).addPosition(width/60, height/30));
    
    motorNameBox.textInput.style('text-align', 'center');
    motorNameBox.textInput.style('font-size', '30px');
    motorNameBox.textInput.value("Motor_1");

    // bind button actions
    submitMotorButton.onPress(()=> {
        motorScrollBar.addTab(constructMotorMenu(motorNameBox.getValue())); 
        addMotorMenu.hide();
        motorNameBox.textInput.value("Motor_"+numMotors);
    });
    addMotorButton.onPress(() => addMotorMenu.show());

    // add all elements
    addMotorMenu.addElement(submitMotorButton);
    addMotorMenu.addElement(motorNameBox);
    addMotorMenu.hide();

    // define and style subsystem title
    subsystemTitleInput = new textArea(new bounds(width/2 - width/10, marginSpacing, width/5, height / 8));
    subsystemTitleInput.textInput.style('text-align', 'center');
    subsystemTitleInput.textInput.style('font-size', '50px');
}

function constructMotorMenu(motorName){
    numMotors ++;
    let newMotorMenu = new menu(motorMenu.bounds.copyDimensions().addPosition(marginSpacing, height/5).addSize(-marginSpacing*2, -(height/8 + marginSpacing)), motorName);
    let listOfVariables = new scrollingList(newMotorMenu.bounds.copyDimensions().addPosition(0, 50).addSize(0, -50), [], scrollingList.scrollVertical);
    for(let i = 0; i < allMotorVariables.length; i++){
        let newLable = new lable(new bounds(0, 0, 50, 30), allMotorVariables[i]);
        let newCheckbox = new checkbox(new bounds(40, 0, 10, 30));
        newCheckbox.bindToElement(newLable);
        listOfVariables.addElement(newLable);
    }
    newMotorMenu.addElement(listOfVariables);
    return newMotorMenu;
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
        for(let f of this.followers){
            f.updateRelativePosition(x, y);
        }
        this.maxX = this.x + this.w;
        this.maxY = this.y + this.h;    
        return this;
    }
    setSize(w, h){
        for(let f of this.followers){
            f.updateRelativeSize(w, h);
        }
        this.w = w;
        this.h = h;
        this.maxX = this.x + this.w;
        this.maxY = this.y + this.h;
        return this;
    }
    addPosition(x, y){
        this.setPosition(this.x + x, this.y + y);
        return this;
    }
    addSize(w, h){
        this.setSize(this.w + w, this.h + h);
        return this;
    }
    addFollower(bounds){
        this.followers.push(new boundsFollower(bounds, this));
        return this;
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
        return (this.x > bounds.x && this.maxX < bounds.maxX && this.y > bounds.y && this.maxY < bounds.maxY);
    }
    isPartiallyWithin(bounds){
        return (this.x < bounds.maxX && this.maxX > bounds.x && this.y < bounds.maxY && this.maxY > bounds.y);
    }
    empty(){
        return new bounds(0, 0, 0, 0);
    }
    drawOutline(){
        push();
        noFill();
        stroke(255, 0, 0);
        rect(this.x, this.y, this.w, this.h);
        pop();
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

        this.offsetX *= this.wScale;
        this.offsetY *= this.hScale;

        this.bounds.setSize(this.bounds.w * this.wScale, this.bounds.h * this.hScale)
        this.bounds.setPosition(this.boundsToFollow.x + this.offsetX, this.boundsToFollow.y + this.offsetY)
    }
    updateRelativePosition(newX, newY){
        this.bounds.x = newX + this.offsetX;
        this.bounds.y = newY + this.offsetY;
    }
}

class boundsAnimation{
    static linear=0;

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
    static left=0;
    static right=1;
    static up=2;
    static down=3;
    static allEllements = [];

    constructor(bounds){
        this.extendedBounds = bounds;
        this.bounds = bounds;
        this.isVisible = true;
        this.currentAnimation = undefined;
        this.boundElements = [];
        element.allEllements.push(this);
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
        for(let e of element.allEllements){
            if(e.isVisible == true) e.draw();
        }
    }
}

class menu extends element{
    constructor(bounds, lable=""){
        super(bounds);
        this.elements = [];
        this.lable = lable;
    }
    addElement(element){
        element.bindToElement(this);
        this.elements.push(element);
    }
    draw(){
        super.draw();
        fill(curColors.primary);
        stroke(curColors.outline);
        rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
        fill(curColors.contrast);
        textAlign(CENTER);
        textSize(this.bounds.w/10);
        text(this.lable, this.bounds.x, this.bounds.y + marginSpacing, this.bounds.w, this.bounds.h);
    }
}

class button extends element{
    constructor(bounds, text){
        super(bounds);
        this.lable = text;
        this.callback = undefined;
        this.hasBeenPressed = false;
    }
    onPress(callback){
        this.callback = callback;
    }
    draw(){
        super.draw();
        fill(curColors.primary);
        if(this.isVisible && mouseBounds.isPartiallyWithin(this.bounds)) {
            fill(curColors.secondary);
            if(mouseIsPressed){
                if(!this.hasBeenPressed && this.callback != undefined) this.callback();
                this.hasBeenPressed = true;
            }
            else this.hasBeenPressed = false;
        }
        else this.hasBeenPressed = false;
        stroke(curColors.outline);
        rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
        fill(curColors.contrast);
        textAlign(CENTER);
        textSize(this.bounds.w/5);
        text(this.lable, this.bounds.x, this.bounds.y + marginSpacing/2, this.bounds.w, this.bounds.h);
    }
}

class textArea extends element{
    constructor(bounds){
        super(bounds);
        this.textInput = createInput();
        this.textInput.position(this.bounds.x, this.bounds.y);
        this.textInput.size(this.bounds.w, this.bounds.h);
    }
    draw(){
        super.draw();
        this.textInput.position(this.bounds.x, this.bounds.y);
        this.textInput.size(this.bounds.w, this.bounds.h);
    }
    getValue(){
        return this.textInput.value();
    }
    show(){
        super.show();
        this.textInput.show();
    }
    hide(){
        super.hide();
        this.textInput.hide();
    }
}

class checkbox extends element{
    constructor(bounds){
        super(bounds)
        this.bounds = bounds;
        this.text = "[  ]";
        this.button = new button(bounds, this.text);
        this.button.onPress(() => this.toggle())
        this.isSelected = false;
    }
    toggle(){
        this.isSelected = !this.isSelected;
        if(this.isSelected) this.text = "[X]";
        else this.text = "[  ]";
    }
    getValue(){
        return this.isSelected;
    }
    draw(){
        super.draw();
        this.button.lable = this.text;
    }
    show(){
        super.show();
        this.button.show();
    }
    hide(){
        super.hide();
        this.button.hide();
    }
}

class lable extends element{
    constructor(bounds, lable){
        super(bounds);
        this.bounds = bounds;
        this.lable = lable;
        this.lableGetter = undefined;
    }
    setLableGetter(getter){
        this.lableGetter = getter;
    }
    draw(){
        super.draw();
        fill(curColors.primary);
        stroke(curColors.outline);
        rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
        fill(curColors.contrast);
        textAlign(LEFT);
        textSize(this.bounds.w/20);
        if(this.lableGetter != undefined) this.lable = this.lableGetter();
        
        text(this.lable, this.bounds.x + marginSpacing, this.bounds.y+marginSpacing/2, this.bounds.w, this.bounds.h);
    }
}

class scrollingList extends element{
    static scrollHorizontal=0;
    static scrollVertical=1;

    constructor(bounds, elements=[], scrollDirection=scrollingList.scrollHorizontal){
        super(bounds);
        this.elements = elements;
        this.scrollDirection = scrollDirection;
        this.scrollPosition = 0; // 0 -> length of list
        for(let e of this.elements){
            e.bindToElement(this);
        }
    }
    updateElementBounds(){
        let totalWidth = 0;
        for(let i = 0; i < this.scrollPosition; i++){
            this.elements[i].hide();
        }
        for(let i = this.scrollPosition; i < this.elements.length; i++){
            this.elements[i].show();
            let newBounds;
            if(this.scrollDirection == scrollingList.scrollVertical){
                newBounds = new bounds(
                    this.bounds.x + marginSpacing,
                    this.bounds.y + marginSpacing+((i-this.scrollPosition)*(30+marginSpacing)),
                    this.bounds.w - (marginSpacing*2),
                    30);
            }
            else{
                newBounds = new bounds(
                    this.bounds.x + (totalWidth) + marginSpacing,
                    this.bounds.y + marginSpacing,
                    this.bounds.h,
                    40);
                totalWidth += this.bounds.h + marginSpacing;
            }
            this.elements[i].bounds.setPosition(newBounds.x, newBounds.y);
            this.elements[i].bounds.setSize(newBounds.w, newBounds.h);

            if(newBounds.maxX > this.bounds.maxX || newBounds.maxY > this.bounds.maxY){
                for(let j = i; j < this.elements.length; j++){
                    this.elements[j].hide();
                }
                break;
            }
        }
    }
    addElement(element){
        this.elements.push(element);
        element.bindToElement(this);
        this.updateElementBounds();
    }
    scrollForward(amount){
        this.scrollPosition += int(amount);
        if(this.scrollPosition > this.elements.length-1) this.scrollPosition = this.elements.length-1;
        this.updateElementBounds();
    }
    scrollBackward(amount){
        this.scrollPosition -= int(amount);
        if(this.scrollPosition < 0) this.scrollPosition = 0;
        this.updateElementBounds();
    }
    draw(){
        super.draw();
        fill(curColors.secondary);
        stroke(curColors.outline);
        rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
        if(mouseBounds.isCompletelyWithin(this.bounds)){
            if(mouseScrolled > 0) this.scrollForward(1);
            if(mouseScrolled < 0) this.scrollBackward(1);
        }
    }
}

class tabScrollBar extends element{
    constructor(bounds){
        super(bounds);
        this.tabs = [];
        this.selectionList = new scrollingList(bounds.copyDimensions());
        this.selectionList.bindToElement(this);
        this.currentTab = 0;
    }
    addTab(menu){
        let newButton = new button(new bounds(0, 0, 0, 0), menu.lable);
        newButton.onPress(() => this.setCurrentTab(this.selectionList.elements.indexOf(newButton)));
        this.selectionList.addElement(newButton);

        this.tabs.push(menu);
        menu.bindToElement(this);

        menu.hide();
    }
    removeTab(index){

    }
    setCurrentTab(index){
        if(index < 0 || index > this.tabs.length){console.error("Index Out Of Bounds In Set Current Tab"); return;}
        if(this.tabs.length == 0) return;
        this.tabs[this.currentTab].hide();
        this.currentTab = index;
        this.tabs[this.currentTab].show();
    }
    draw(){
        super.draw();
    }
}