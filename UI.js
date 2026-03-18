// define all UI elements
let marginSpacing = 10;
let curColors;

let motorMenu;
let motorScrollBar;

let mouseBounds;

let addMotorButton;
let addMotorMenu;
let submitMotorButton;
let motorNameBox;

let subsystemTitleInput;

let allMotorLogVariables = ["Position","Velocity","PositionClosedLoopError","VelocityClosedLoopError","SupplyCurrent","Connected","Temperature"];
let valuedMotorConfigVariables = ["CAN ID", "SupplyCurrentLimit","StatorCurrentLimit","KP","KS","KV","SensorToMechanismRatio"];
let booleanMotorConfigVariables = ["Include Default Feedback","Inverted"];
let exclusiveMotorConfigVariables = [["x44","x60"],["Position Controlled","Velocity Controlled"]]
let numMotors = 0;

let constantsMenu;
let constantList;

let addConstantButton;
let addConstantMenu;
let submitConstantButton;
let constantNameBox;
let constantValueBox;
let buttonHasBeenPressed = false;

let saveSubsystemFilesButton;
let motorValueSaves = [];
let constantSave;

function initializeUI(){
    //global values
    curColors = new colorScheme([50, 50, 50], [60, 60, 60], [ 255,103,31], [120, 120, 120]);
    mouseBounds = new bounds(mouseX - 1, mouseY - 1, 2, 2);

    // define constant menu elements
    constantsMenu = new menu(new bounds(width - width/5, 0, width/5, height), "Constants");
    constantList = new scrollingList(constantsMenu.bounds.copyDimensions().addPosition(marginSpacing, height/8).addSize(-marginSpacing*2, -((height/8)+marginSpacing)), [], scrollingList.scrollVertical);
    
    constantSave = new valueSave("Constants");

    constantsMenu.addElement(constantList);
    // define add constant menu
    addConstantMenu = new menu(new bounds(width/2-width/10, height/2-height/10, width/5, height/5));
    submitConstantButton = new button(new bounds(width/2 - width/40, height/2 + height/10 + marginSpacing, width/20, height/18), "Add Constant");
    addConstantButton = new button(new bounds(width - width/5 + marginSpacing, marginSpacing, 90, 50), "Add Constant");
    constantNameBox = new textArea(addConstantMenu.bounds.copyDimensions().addSize(-width/30, -height/8).addPosition(width/60, marginSpacing));
    constantValueBox = new textArea(addConstantMenu.bounds.copyDimensions().addSize(-width/30, -height/8).addPosition(width/60, marginSpacing*2 + height/12));
    
    constantNameBox.textInput.style('text-align', 'center');
    constantNameBox.textInput.style('font-size', '20px');
    constantNameBox.textInput.style('color', `rgba(${curColors.contrast})`);
    constantNameBox.textInput.style('background-color', `rgba(${curColors.primary})`);
    constantNameBox.textInput.value("Name");

    constantValueBox.textInput.style('text-align', 'center');
    constantValueBox.textInput.style('font-size', '20px');
    constantValueBox.textInput.style('color', `rgba(${curColors.contrast})`);
    constantValueBox.textInput.style('background-color', `rgba(${curColors.primary})`);
    constantValueBox.textInput.value("Value");

    // bind button actions
    submitConstantButton.onPress(()=> {
        let newMenu = new menu(new bounds(0, 0, 120, 60), "");
        let removeButton = new button(new bounds(5, 10, 20, 40), "X")
        let nameArea = new textArea(new bounds(30, 10, 50, 20));
        let valueArea = new textArea(new bounds(85, 10, 25, 20));

        nameArea.textInput.value(constantNameBox.textInput.value());
        valueArea.textInput.value(constantValueBox.textInput.value());

        nameArea.textInput.style('color', `rgba(50, 50, 50)`);
        nameArea.textInput.style('background-color', `rgba(${curColors.contrast})`);
        
        valueArea.textInput.style('color', `rgba(50, 50, 50)`);
        valueArea.textInput.style('background-color', `rgba(${curColors.contrast})`);

        nameArea.onUpdate(() => constantSave.updateValue(nameArea.value(), valueArea.value()));

        newMenu.addElement(removeButton);
        newMenu.addElement(nameArea);
        newMenu.addElement(valueArea);

        constantList.addElement(newMenu);
        removeButton.onPress(() => constantList.removeElement(constantList.elements.indexOf(newMenu)));
        constantNameBox.textInput.value("Name");
        constantValueBox.textInput.value("Value");
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
    motorNameBox.textInput.style('color', `rgba(${curColors.contrast})`);
    motorNameBox.textInput.style('background-color', `rgba(${curColors.primary})`);
    motorNameBox.textInput.value("Motor_1");

    // bind button actions
    submitMotorButton.onPress(()=> {
        motorScrollBar.addTab(constructMotorMenu(motorNameBox.value())); 
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
    subsystemTitleInput.textInput.style('color', `rgba(${curColors.contrast})`);
    subsystemTitleInput.textInput.style('background-color', `rgba(${curColors.primary})`);
    subsystemTitleInput.textInput.value("Subsystem");

    // define and style save button
    saveSubsystemFilesButton = new button(new bounds(width/2-width/15, marginSpacing*3+height/8, width/7.5, height/15), "Save");
    saveSubsystemFilesButton.onPress(()=>{
        fileManager.saveAllFiles(getSubsystem());
    });
}

function constructMotorMenu(motorName){
    numMotors ++;
    let newMotorMenu = new menu(motorMenu.bounds.copyDimensions().addPosition(marginSpacing, 120).addSize(-marginSpacing*2, -(120 + marginSpacing)), motorName);

    let logMenu = new menu(newMotorMenu.bounds.copyDimensions().addPosition(0, 120).addSize(0, -120), "Logged Variables");
    let configMenu = new menu(newMotorMenu.bounds.copyDimensions().addPosition(0, 120).addSize(0, -120), "Config Values");

    let listOfLogVariables = new scrollingList(logMenu.bounds.copyDimensions().addPosition(0, 50).addSize(0, -50), [], scrollingList.scrollVertical);
    let listOfConfigVariables = new scrollingList(configMenu.bounds.copyDimensions().addPosition(0, 50).addSize(0, -50), [], scrollingList.scrollVertical);

    let removeButton = new button(newMotorMenu.bounds.copyDimensions().addPosition(marginSpacing, marginSpacing).setSize(90, 30), "Remove");
    
    let configOrLogScrollBar = new tabScrollBar(newMotorMenu.bounds.copyDimensions().addPosition(marginSpacing, 50).setSize(newMotorMenu.bounds.w-marginSpacing*2, 60))

    let newMotorSave = new valueSave(motorName);

    for(let i = 0; i < allMotorLogVariables.length; i++){
        let newLable = new lable(new bounds(0, 0, 50, 30), allMotorLogVariables[i]);
        let newCheckbox = new checkbox(new bounds(40, 0, 10, 30));
        newCheckbox.bindToElement(newLable);

        newCheckbox.button.onPress(() => newMotorSave.updateValue(allMotorLogVariables[i], newCheckbox.value()));

        listOfLogVariables.addElement(newLable);
    }

    for(let i = 0; i < valuedMotorConfigVariables.length; i++){
        let newLable = new lable(new bounds(0, 0, 50, 40), valuedMotorConfigVariables[i]);
        let newTextArea = new textArea(new bounds(39, 0, 10, 30));

        newTextArea.textInput.style('color', `rgba(${curColors.contrast})`);
        newTextArea.textInput.style('background-color', `rgba(${curColors.primary})`);
        newTextArea.textInput.value("0");

        newTextArea.onUpdate(() => newMotorSave.updateValue(valuedMotorConfigVariables[i], newTextArea.value()));

        newTextArea.bindToElement(newLable);
        listOfConfigVariables.addElement(newLable);
    }
    
    for(let i = 0; i < booleanMotorConfigVariables.length; i++){
        let newLable = new lable(new bounds(0, 0, 50, 30), booleanMotorConfigVariables[i]);
        let newCheckbox = new checkbox(new bounds(40, 0, 10, 30));

        newCheckbox.button.onPress(() => newMotorSave.updateValue(booleanMotorConfigVariables[i], newCheckbox.value()));

        newCheckbox.bindToElement(newLable);
        listOfConfigVariables.addElement(newLable);
    }

    for(let i = 0; i < exclusiveMotorConfigVariables.length; i++){
        let newLable1 = new lable(new bounds(0, 0, 50, 30), exclusiveMotorConfigVariables[i][0]);
        let newLable2 = new lable(new bounds(0, 0, 50, 30), exclusiveMotorConfigVariables[i][1]);
        let newCheckbox1 = new checkbox(new bounds(40, 0, 10, 30));
        let newCheckbox2 = new checkbox(new bounds(40, 0, 10, 30));

        newCheckbox1.bindToElement(newLable1);
        newCheckbox2.bindToElement(newLable2);
        
        newCheckbox1.makeExclusive(newCheckbox2);

        newCheckbox1.button.onPress(() => {
            newMotorSave.updateValue(exclusiveMotorConfigVariables[i][0], newCheckbox1.value());
            newMotorSave.updateValue(exclusiveMotorConfigVariables[i][1], newCheckbox2.value());
        });
        newCheckbox2.button.onPress(() => {
            newMotorSave.updateValue(exclusiveMotorConfigVariables[i][0], newCheckbox1.value());
            newMotorSave.updateValue(exclusiveMotorConfigVariables[i][1], newCheckbox2.value());
        });

        listOfConfigVariables.addElement(newLable1);
        listOfConfigVariables.addElement(newLable2);
    }

    logMenu.addElement(listOfLogVariables);
    configMenu.addElement(listOfConfigVariables);

    configOrLogScrollBar.addTab(logMenu);
    configOrLogScrollBar.addTab(configMenu);

    removeButton.onPress(() => {
        if(motorScrollBar.tabs.length > 1) {
            motorScrollBar.removeTab(motorScrollBar.tabs.indexOf(newMotorMenu));
            motorValueSaves.splice(motorValueSaves.indexOf(newMotorSave), 1);
            newMotorMenu.hide();
        }});

    newMotorMenu.addElement(configOrLogScrollBar);
    newMotorMenu.addElement(removeButton);
    return newMotorMenu;
}

class valueSave{
    constructor(name){
        this.name = name;
        this.values = [];
        motorValueSaves.push(this);
    }
    updateValue(key, value){
        for(let v of this.values){
            if(v[0] == key) {
                v[1] = value;
                return;
            }   
        }
        this.values.push([key, value]);
    }
    getValue(key){
        for(let v of this.values){
            if(v[0] == key) return v[1];
        }
        console.log("Requested but failed to find value at key: " + key)
        return undefined;        
    }
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
        stroke(0);
        textAlign(CENTER);
        textSize(this.bounds.w/10);
        text(this.lable, this.bounds.x, this.bounds.y + marginSpacing, this.bounds.w, this.bounds.h);
    }
}

class button extends element{
    constructor(bounds, text){
        super(bounds);
        this.lable = text;
        this.callbacks = [];
        this.hasBeenPressed = false;
    }
    onPress(callback){
        this.callbacks.push(callback);
    }
    draw(){
        super.draw();
        fill(curColors.primary);
        if(this.isVisible && mouseBounds.isPartiallyWithin(this.bounds)) {
            fill(curColors.secondary);
            if(mouseIsPressed){
                if(!buttonHasBeenPressed && !this.hasBeenPressed && this.callbacks != []) {
                    for(let callback of this.callbacks){
                        callback();
                    }
                }
                this.hasBeenPressed = true;
                buttonHasBeenPressed = true;
            }
            else this.hasBeenPressed = false;
        }
        else this.hasBeenPressed = false;
        stroke(curColors.outline);
        rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
        fill(curColors.contrast);
        stroke(0);
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
        this.onUpdateCalls = [];
    }
    onUpdate(callback){
        this.onUpdateCalls.push(callback);
    }
    draw(){
        super.draw();
        this.textInput.position(this.bounds.x, this.bounds.y);
        this.textInput.size(this.bounds.w, this.bounds.h);
        for(let callback of this.onUpdateCalls){
            callback();
        }
    }
    value(){
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
    setValue(value){
        this.isSelected = value;
        if(this.isSelected) this.text = "[X]";
        else this.text = "[  ]";
    }
    makeExclusive(checkbox){
        this.button.onPress(()=> checkbox.toggle());
        checkbox.button.onPress(()=> this.toggle());
        this.setValue(true);
    }
    value(){
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
        stroke(0);
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
            if(this.elements.length == 0) break;
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
    removeElement(index){
        this.elements[index].hide()
        this.elements.splice(index, 1);
        this.updateElementBounds();
    }
    addElement(element){
        this.elements.push(element);
        element.bindToElement(this);
        this.updateElementBounds();
    }
    scrollForward(amount){
        this.scrollPosition += int(amount);
        this.scrollPosition = constrain(this.scrollPosition, 0, this.elements.length-1)
        this.updateElementBounds();
    }
    scrollBackward(amount){
        this.scrollPosition -= int(amount);
        this.scrollPosition = constrain(this.scrollPosition, 0, this.elements.length-1)
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
        this.selectionList.removeElement(index)
        this.tabs.splice(index, 1);
        this.currentTab = index-1;
        if(this.currentTab < 0) this.currentTab = 0;
        this.tabs[this.currentTab].show();
    }
    setCurrentTab(index){
        if(index < 0 || index > this.tabs.length){console.error("Index Out Of Bounds In Set Current Tab"); return;}
        if(this.tabs.length == 0) return;
        this.tabs[this.currentTab].hide();
        this.currentTab = index;
        this.tabs[this.currentTab].show();
    }
    show(){
        this.isVisible = true;
        this.selectionList.show();
        for(let i = 0; i < this.tabs; i++){
            this.tabs[i].hide();
        }
        this.tabs[this.currentTab].show()
    }
}