class Subsystem{
    constructor(name){
        this.name = name;
        this.constants = [];
        this.motors = [];
        this.controlMethods = []
    }

    addMotor(motor){
        this.motors.push(motor);
        return this;
    }

    addControlMethod(controlMethod){
        this.controlMethods.push(controlMethod)
        return this;
    }

    addConstant(type, name, value){
        this.constants.push(new subsystemConstant(type, name, value));
        return this;
    }

    getAllStatusUpdates(){
        returnString = "";
        for(let i = 0; i < this.motors.length; i++){
            returnString += this.motors[i].getStatusUpdate();
        }
        for(let i = 0; i < this.motors.length; i++){
            for(let j = 0; j < this.motors[i].loggedVariables.length; j++){
                returnString += this.motors[i].loggedVariables[j].getStatusUpdate()
            }
        }
    }
}

class controlMethod{
    static positionVoltage = "PositionVoltage";
    static velocityVoltage = "VelocityVoltage";

    constructor(name, motor, controlType, inputName, returnsCommand){
        this.name = name;
        this.motor = motor;
        this.controlType = controlType;
        this.inputName = inputName;
        this.returnsCommand = returnsCommand;
    }

    getRealFunctionAsString(){
        if(this.returnsCommand) return `public static Command ${this.name}(${this.controlType == motor.positionVoltage?"Angle":"AngularVelocity"} ${this.inputName}){\n\treturn Commands.runOnce(()-> ${this.motor.name}.setControl(new ${this.controlType}(${this.inputName})))`
        return `public static void ${this.name}(${this.controlType == motor.positionVoltage?"Angle":"AngularVelocity"} ${this.inputName}){\n\t${this.motor.name}.setControl(new ${this.controlType}(${this.inputName}))`
    }
}

class motor{
    static x44;
    static x60;

    constructor(type, name, subsystem){
        this.type = type;
        this.name = name;
        this.configValues = [];
        this.neutralMode = "";
        this.subsystem = subsystem
        this.loggedVariables = [];
    }
    setNeutralMode(value){
        this.neutralMode = value;
    }
    addConfigValue(configSuperType, configSubType, configValue){
        let alreadyHasSuperType = false;
        for(let value of this.configValues){
            if(value.superType == configSuperType){
                value.addConfigValue(configSubType, configValue);
                alreadyHasSuperType = true;
                break;
            }
        }
        if(!alreadyHasSuperType) this.configValues.push(new motorConfigValue(configSuperType, configSubType, configValue));
    }
    getDefinitionAsString(){
        let individualNamePieces = this.name.split(/(?=[A-Z])/);
        let newFormatName = ""
        for(let i = 0; i < individualNamePieces.length; i++){
            newFormatName += individualNamePieces[i];
            if(i != individualNamePieces.length) newFormatName += "_";
        }
        return `private final TalonFX ${this.name}Motor =\n new TalonFX(${this.subsystem.name}Constants.${this.name.toUpperCase()}_MOTOR_ID, ${this.subsystem.name}Constants.canivoreCANBus)`
    }
    getConfigAsString(){
        let allMotorValues = "";
        for(let value of this.configValues){
            allMotorValues += `\n${value.getAsString()}`
        }
        allMotorValues += ";"
        return `var ${this.name}Config = \n\tnew TalonFXConfiguration()${allMotorValues}`
    }
    addLoggedVariable(type){
        this.loggedVariables.push(new motorLoggedVaraible(this, type));
    }
    getStautsSignalDefinition(){
        let variableNames = "";
        for(let i = 0; i < this.loggedVariables.length; i++){
            variableNames += `${this.name}${this.loggedVariables.variableType}`
            if(i != this.loggedVariables.length) variableNames += ", ";
        }
        return `BaseStatusSignal.setUpdateFrequencyForAll(\n${this.name}.getIsProLicensed().getValue() ? 200 : 50, ${variableNames});`
    }
    getStatusUpdate(){
        let variableNames = "";
        for(let i = 0; i < this.loggedVariables.length; i++){
            variableNames += `${this.name}${this.loggedVariables.variableType}`
            if(i != this.loggedVariables.length) variableNames += ", ";
        }
        return `var ${this.motors[i].name}Status = BaseStatusSignal.refreshAll(${variableNames});`;
    }
}

class motorLoggedVaraible{
    static velocity = "Velocity";
    static position = "Position";
    static closedLoopError = "ClosedLoopError";
    static position = "Position";
    static supplyCurrent = "SupplyCurrent";
    static motorStallCurrent = "MotorStallCurrent";

    constructor(motor, variableType){
        this.motor = motor;
        this.variableType = variableType;
    }
    getStatusDefinition(){
        return `private final StatusSignal<${this.variableType}> ${this.motor.name}${this.variableType} = ${this.motor.name}.get${this.type}();`
    }
    getStatusUpdate(){
        return `inputs.${this.motor.name}${this.variableType} = ${this.motor.name}${this.variableType}.getValue();`
    }
}

class motorConfig{
    static Feedback = "Feedback";
    static Slot0 = "Slot0";
    static FeedbackSensorSource = "FeedbackSensorSource";
    static SensorToMechanismRatio = "SensorToMechanismRatio"
    static MotorOutput = "MotorOutput"
    static Inverted = "Inverted"
    static Brake = 'Brake'
}

class motorConfigValue{
    constructor(superType, subTypes, subValues){
        this.superType = superType;
        this.subTypes = subTypes;
        this.subValues = subValues;
        if(this.subTypes.length != this.subValues.length) console.error("Impropper Number of types and values!")
    }
    addSubValue(subType, subValue){
        this.subTypes.push(subType);
        this.subValues.push(subValue);
        return this;
    }
    getAsString(){
        totalValueList = "";
        for(let i = 0; i < this.subTypes.length; i++){
            totalValueList += `\n\t\t.with${this.subTypes[i]}(\n${this.subValues[i]}\n)`
        }
        return `.with${this.type}(\n\tnew${this.type}Configs()${totalValueList}`
    }
}

class subsystemConstant{
    constructor(type, name, value){
        this.type = type;
        this.name = name;
        this.value = value;
    }
}