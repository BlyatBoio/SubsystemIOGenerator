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
        let returnString = "";
        for(let i = 0; i < this.motors.length; i++){
            returnString += this.motors[i].getStatusUpdate()+"\n\t\t";
        }
        for(let i = 0; i < this.motors.length; i++){
            for(let j = 0; j < this.motors[i].loggedVariables.length; j++){
                returnString += this.motors[i].loggedVariables[j].getStatusUpdate()+"\n\t\t"
            }
        }
        return returnString;
    }
}

class controlMethod{
    static positionVoltage = "PositionVoltage";
    static velocityVoltage = "VelocityVoltage";

    constructor(name, motor, controlType, inputName){
        this.name = name;
        this.motor = motor;
        this.controlType = controlType;
        this.inputName = inputName;
    }

    getRealFunctionAsString(){
        return `public static void ${this.name}(${this.controlType == motor.positionVoltage?"Angle":"AngularVelocity"} ${this.inputName}){\n\t\t${this.motor.name}.setControl(new ${this.controlType}(${this.inputName}));\n\t}`
    }
    
    getSimFunctionAsString(){
        return `public static void ${this.name}(${this.controlType == motor.positionVoltage?"Angle":"AngularVelocity"} ${this.inputName}){\n\t\t${this.motor.name}Controller.setSetpoint(${this.inputName}.in(${this.controlType == motor.positionVoltage?"Rotations":"RotationsPerSecond"}));\n\t}`
    }
}

class motor{
    static x44;
    static x60;
    static positionControl = "Position";
    static velocityControl = "velocity";

    constructor(type, name, subsystem, prefferedControlType){
        this.type = type;
        this.name = name;
        this.configValues = [];
        this.neutralMode = "";
        this.subsystem = subsystem
        this.loggedVariables = [];
        this.prefferedControlType = prefferedControlType;
    }
    setNeutralMode(value){
        this.neutralMode = value;
    }
    addConfigValue(configSuperType, configSubType, configValue){
        let alreadyHasSuperType = false;
        for(let value of this.configValues){
            if(value.superType == configSuperType){
                value.addSubValue(configSubType, configValue);
                alreadyHasSuperType = true;
                break;
            }
        }
        if(!alreadyHasSuperType) this.configValues.push(new motorConfigValue(configSuperType, [configSubType], [configValue]));
    }
    getRealDefinitionAsString(){
        let individualNamePieces = this.name.split(/(?=[A-Z])/);
        let newFormatName = ""
        for(let i = 0; i < individualNamePieces.length; i++){
            newFormatName += individualNamePieces[i];
            if(i != individualNamePieces.length) newFormatName += "_";
        }
        return `private final TalonFX ${this.name} =\n\t\tnew TalonFX(${this.subsystem.name}Constants.${this.name.toUpperCase()}_MOTOR_ID);`
    }
    getSimDefinitionAsString(){
        return `private static final DCMotor ${this.name} = DCMotor.getKrakenX${this.type==motor.x44?"44":"60"}${this.type==motor.x44?"(1)":"Foc(1)"};\n\tprivate DCMotorSim ${this.name}Sim;`
    }
    getConfigAsString(){
        let allMotorValues = "";
        for(let value of this.configValues){
            allMotorValues += `\n\t\t\t\t${value.getAsString()}`
        }
        allMotorValues += ";"
        return `var ${this.name}Config = \n\t\t\tnew TalonFXConfiguration()${allMotorValues}`
    }
    addLoggedVariable(type){
        this.loggedVariables.push(new motorLoggedVaraible(this, type));
        return this;
    }
    getStatusSignalDefinition(){
        let variableNames = "";
        for(let i = 0; i < this.loggedVariables.length; i++){
            if(this.loggedVariables[i].valueType != motorLoggedVaraible.isConnected){
                variableNames += `${this.name}${this.loggedVariables[i].valueType}`
                if(i < this.loggedVariables.length-1) variableNames += ", ";
            }
        }
        return `BaseStatusSignal.setUpdateFrequencyForAll(\n\t\t\t${this.name}.getIsProLicensed().getValue() ? 200 : 50${variableNames!=""?", ":""}${variableNames });`
    }
    getStatusUpdate(){
        let variableNames = "";
        for(let i = 0; i < this.loggedVariables.length; i++){
            if(this.loggedVariables[i].valueType != motorLoggedVaraible.isConnected){
                variableNames += `${this.name}${this.loggedVariables[i].valueType}`
                if(i < this.loggedVariables.length-1) variableNames += ", ";
            }
        }
        return `var ${this.name}Status = BaseStatusSignal.refreshAll(${variableNames});`;
    }
}

class motorLoggedVaraible{
    static position = "Position";
    static velocity = "Velocity";
    static positionClosedLoopError = "PositionClosedLoopError";
    static velocityClosedLoopError = "VelocityClosedLoopError";
    static supplyCurrent = "SupplyCurrent";
    static isConnected = "Connected";
    static temperature = "Temperature";

    constructor(motor, valueType){
        this.motor = motor;
        this.valueType = valueType;
    }
    getStatusDefinition(){
        if(this.valueType==motorLoggedVaraible.isConnected) return "";
        return `\tprivate final StatusSignal<${this.getVariableType().charAt(0).toUpperCase()+this.getVariableType().slice(1)}> ${this.motor.name}${this.valueType} = ${this.motor.name}.${this.getRealGetterFunction(this.valueType)};`
    }
    getStatusUpdate(){
        if(this.valueType == motorLoggedVaraible.isConnected) return `inputs.${this.motor.name}Connected = ${this.motor.name}Debounce.calculate(${this.motor.name}Status.isOK());`
        return `inputs.${this.motor.name}${this.valueType} = ${this.motor.name}${this.valueType}.getValue();`
    }
    getSimGetterFunction(){
        switch(this.valueType){
            case motorLoggedVaraible.velocity: return `${this.motor.name}Sim.getAngularVelocity()`;
            case motorLoggedVaraible.position: return `${this.motor.name}Sim.getAngularPosition()`;
            case motorLoggedVaraible.positionClosedLoopError: return `${this.motor.name}Controller.getError()`;
            case motorLoggedVaraible.velocityClosedLoopError: return `${this.motor.name}Controller.getError()`;
            case motorLoggedVaraible.supplyCurrent: return "null";
            case motorLoggedVaraible.motorStallCurrent: return "null";
            case motorLoggedVaraible.isConnected: return "true";
            case motorLoggedVaraible.temperature: return "Kelvin.zero()";
        }
    }
    getVariableType(){
        switch(this.valueType){
            case motorLoggedVaraible.velocity: return "AngularVelocity";
            case motorLoggedVaraible.position: return "Angle";
            case motorLoggedVaraible.positionClosedLoopError: return "double";
            case motorLoggedVaraible.velocityClosedLoopError: return "double";
            case motorLoggedVaraible.supplyCurrent: return "Current";
            case motorLoggedVaraible.motorStallCurrent: return "Current";
            case motorLoggedVaraible.isConnected: return "boolean";
            case motorLoggedVaraible.temperature: return "Temperature";
        }
    }
    getRealGetterFunction(){
        switch(this.valueType){
            case motorLoggedVaraible.positionClosedLoopError: return `getClosedLoopError()`;
            case motorLoggedVaraible.velocityClosedLoopError: return `getClosedLoopError()`;
            case motorLoggedVaraible.temperature: return "getDeviceTemp()";
            default: return `get${this.valueType}()`;
        }
    }
    getDefaultValue(){
        switch(this.valueType){
            case motorLoggedVaraible.velocity: return "RotationsPerSecond.zero()";
            case motorLoggedVaraible.position: return "Degrees.zero()";
            case motorLoggedVaraible.positionClosedLoopError: return "0";
            case motorLoggedVaraible.velocityClosedLoopError: return "0";
            case motorLoggedVaraible.supplyCurrent: return "Amps.zero()";
            case motorLoggedVaraible.motorStallCurrent: return "Amps.zero()";
            case motorLoggedVaraible.isConnected: return "true";
            case motorLoggedVaraible.temperature: return "Kelvin.zero()";
        }
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
    static CurrentLimits = "CurrentLimits"
    static SupplyCurrentLimit = "SupplyCurrentLimit"
    static StatorCurrentLimit = "StatorCurrentLimit"
    static KP = "KP";
    static KS = "KS";
    static KV = "KV";
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
        let totalValueList = "";
        for(let i = 0; i < this.subTypes.length; i++){
            totalValueList += `\n\t\t\t\t.with${this.subTypes[i]}(${this.subValues[i]})`
        }
        return `.with${this.superType}(\n\t\t\t\t\tnew ${this.superType}Configs()${totalValueList})`
    }
}

class subsystemConstant{
    constructor(type, name, value){
        this.type = type;
        this.name = name;
        this.value = value;
    }
}