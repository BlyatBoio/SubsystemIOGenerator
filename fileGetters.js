class fileManager{
    static saveAllFiles(subsystem){
        // folder path / subsytemConstants.java
        /*
        */
        saveStrings([this.getClassString(subsystem)], `${subsystem.name}`, "java");
        saveStrings([this.getConstantsString(subsystem)], `${subsystem.name}Constants`, "java");
        saveStrings([this.getIOString(subsystem)], `${subsystem.name}IO`, "java");
        saveStrings([this.getSimString(subsystem)], `${subsystem.name}IOSim`, "java");
        saveStrings([this.getRealString(subsystem)], `${subsystem.name}IOReal`, "java");
    }

    static getConstantsString(subsystem){
        let constants = "";
        for(let constant of subsystem.constants){
            constants += `\n\tpublic static final ${constant.type} ${constant.name} = ${constant.value};`;
        }
        return `public class ${subsystem.name}Constants{${constants}\n}`;
    }

    static getClassString(subsystem){
        let commandMethodString = "";
        let gettersString = "";

        for(let method of subsystem.controlMethods){
            commandMethodString += 
`\n\tpublic Command ${method.name}(${method.controlType} ${method.inputName}){
\t\treturn Commands.runOnce(()->\n\t\t\tthis.io.${method.name}(${method.inputName}));
\t}`
        }

        for(let motor of subsystem.motors){
            for(let value of motor.loggedVariables){
                gettersString +=
`\n\tpublic ${value.getVariableType()} get${motor.name}${value.valueType}(){
\t\treturn inputs.${motor.name}${value.valueType};
\t}`
            }
        }

        let returnString = 
`public class ${subsystem.name} extends SubsystemBase{
\tpublic final ${subsystem.name}IO io;
\tprivate final ${subsystem.name}IOInputsAutoLogged inputs = new ${subsystem.name}IOInputsAutoLogged();

\tpublic ${subsystem.name}(${subsystem.name}IO io) {
\t\tthis.io = io;
\t}
\t@Override
\tpublic void periodic(){
\t\tio.updateInputs(inputs);
\t\tLogger.processInputs("${subsystem.name}", inputs);
\t}
${commandMethodString}
${gettersString}
}`;
        return returnString;
    }

    static getIOString(subsystem){
        let variableDefinitions = "";

        for(let motor of subsystem.motors){
            for(let value of motor.loggedVariables){
                variableDefinitions += `\n\t\tpublic ${value.getVariableType()} ${motor.name}${value.valueType} = ${value.getDefaultValue()};`;
            }
        }

        let controlMethodDefinitions = "";
        for(let method of subsystem.controlMethods){
            controlMethodDefinitions += `\n\n\tpublic default void ${method.name}(${method.controlType} ${method.inputName}) {}`
        }

        let returnString =  
`public interface ${subsystem.name}IO {
\t@AutoLog
\tpublic static class ${subsystem.name}IOInputs {${variableDefinitions}
\t}

\tpublic default void updateInputs(${subsystem.name}IOInputs inputs) {}${controlMethodDefinitions}

}`;
        return returnString
    }

    static getSimString(subsystem){
        let motorDefinitions = ""
        let pidDefinitions = "";
        let voltsDefinitions = "";
        let motorSimDefinitions = "";
        let voltUpdates = "";
        let inputUpdates = "";

        for(let motor of subsystem.motors){
            motorDefinitions += motor.getSimDefinitionAsString()+"\n\t";
            pidDefinitions += `\n\tprivate static PIDController ${motor.name}Controller = new PIDController(0, 0, 0); //TODO Auto generated`
            voltsDefinitions += `\n\tprivate double ${motor.name}AppliedVolts = 0;`
            
            motorSimDefinitions += `\t\t${motor.name}Sim =\n\t\tnew DCMotorSim(\n\t\t\tLinearSystemID.createDCMotorSystem(${motor.name}, 0.02, 1), //TODO Auto Generated\n\t\t\t${motor.name});\n`
            
            voltUpdates += `\n\n\t\t${motor.name}AppliedVolts = ${motor.name}Controller.calculate(${motor.name}Sim.getAngular${motor.prefferedControlType}());`
            voltUpdates += `\n\t\t${motor.name}Sim.setInputVoltate(${motor.name}AppliedVolts);`
            voltUpdates += `\n\t\t${motor.name}Sim.update(0.02);`
            
            for(let value of motor.loggedVariables){
                inputUpdates += `inputs.${motor.name}${value.valueType} = ${value.getSimGetterFunction()};\n\t\t`
            }
            inputUpdates += "\n\t\t"
        }

        let controlMethodDefinitions = "";
        
        for(let i = 0; i < subsystem.controlMethods.length; i++){
            controlMethodDefinitions += subsystem.controlMethods[i].getSimFunctionAsString()+"\n\t";
        }
        let returnString =
`public class ${subsystem.name}IOSim{
\t${motorDefinitions}\n${pidDefinitions}\n${voltsDefinitions}

\tpublic ${subsystem.name}IOSim(){
${motorSimDefinitions}
\t}
\t@Override
\tpublic void updateInputs(${subsystem.name}IOInputs inputs){${voltUpdates}\n\n\t\t${inputUpdates}
\t}
\t${controlMethodDefinitions}
}`;
        return returnString;
    }
    
    static getRealString(subsystem){
        let motorDefinitions = ""
        let debouncerDefinitions = ""
        let statusSignalDefinitions = ""
        let motorConfigDefinitions = "";
        let neutralDefinitions = ""
        let tryUntilOkDefinitions = ""
        let baseStatusSignalDefinitions = "";

        for(let motor of subsystem.motors){
            motorDefinitions += motor.getRealDefinitionAsString()+"\n\t";
            debouncerDefinitions += `private final Debouncer ${motor.name}Debounce = new Debouncer(0.5);\n\t`;

            for(let j = 0; j < motor.loggedVariables.length; j++){
                statusSignalDefinitions += motor.loggedVariables[j].getStatusDefinition()+"\n";
            }

            motorConfigDefinitions += motor.getConfigAsString()+"\n\t";
            neutralDefinitions += `${motor.name}.setNeutralMode(${motor.neutralMode});`;
            tryUntilOkDefinitions += `tryUntilOk(\n\t\t\t5,\n\t\t\t() ->${motor.name}\n\t\t\t.getConfigurator()\n\t\t\t.apply(${motor.name}Config, 0.25));\n\t\t`;
            baseStatusSignalDefinitions += motor.getStautsSignalDefinition()+"\n\t\t";
        }

        let controlMethodDefinitions = "";
        
        for(let i = 0; i < subsystem.controlMethods.length; i++){
            controlMethodDefinitions += subsystem.controlMethods[i].getRealFunctionAsString()+"\n\t";
        }

        let returnString = 
`public class ${subsystem.name}IOReal{
\t${motorDefinitions}
\t${debouncerDefinitions}
${statusSignalDefinitions}
\tpublic ${subsystem.name}IOReal{
\t\t${motorConfigDefinitions}
\t\t${neutralDefinitions}
\t\t${tryUntilOkDefinitions}
\t\t${baseStatusSignalDefinitions}
\t}
\t
\t@Override
\tpublic void updateInputs(${subsystem.name}IOInputs inputs) {
\t\t${subsystem.getAllStatusUpdates()}
\t}
\t${controlMethodDefinitions}
}`;
        return returnString;
    }
}