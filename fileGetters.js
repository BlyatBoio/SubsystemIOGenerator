class fileManager{
    static saveAllFiles(subsystem){
        // folder path / subsytemConstants.java
        //saveStrings([this.getConstantsString(subsystem)], `${subsystem.name}/${subsystem.name}Constants`, "java");
        saveStrings([this.getRealString(subsystem)], `${subsystem.name}/${subsystem.name}IOReal`, "java");
    }

    static getConstantsString(subsystem){
        let constants = "";
        for(let constant of subsystem.constants){
            constants += `\n\t${constant.type} ${constant.name} = ${constant.value};`;
        }
        return `public class ${subsystem.name}Constants{${constants}\n}`;
    }

    static getClassString(subsystem){
        return `public class ${subsystem.name}{\n}`;
    }

    static getIOString(subsystem){
        return `public class ${subsystem.name}IO{\n}`;
    }

    static getSimString(subsystem){
        return `public class ${subsystem.name}IOSim{\n}`;
    }
    
    static getRealString(subsystem){
        let motorDefinitions = ""
        let debouncerDefinitions = ""
        let statusSignalDefinitions = ""
        let motorConfigDefinitions = "";
        let neutralDefinitions = ""
        let tryUntilOkDefinitions = ""
        let baseStatusSignalDefinitions = "";

        for(let i = 0; i < subsystem.motors.length; i++){
            motorDefinitions += subsystem.motors[i].getDefinitionAsString+"\n";
            debouncerDefinitions += `${subsystem.motors[i].name}Debounce = new Debouncer(0.5)`;

            for(let j = 0; j < subsystem.motors[i].loggedVariables.length; j++){
                statusSignalDefinitions += subsystem.motors[i].loggedVariables[j].getStatusDefinition()+"\n";
            }

            motorConfigDefinitions += subsystem.motors[i].getConfigAsString();
            neutralDefinitions += `${subsystem.motors[i].name}.setNeutralMode(${subsystem.motors[i].neutralMode});`;
            tryUntilOkDefinitions += `tryUntilOk(\n5,\n() ->${subsystem.motors[i].name}\n.getConfigurator()\n.apply(${subsystem.motors[i].name}Config, 0.25));`;
            baseStatusSignalDefinitions += subsystem.motors[i].getStautsSignalDefinition();
        }

        let controlMethodDefinitions = "";
        
        for(let i = 0; i < subsystem.controlMethods.length; i++){
            controlMethodDefinitions += subsystem.controlMethods[i].getRealFunctionAsString();
        }

        let returnString = 
`public class ${subsystem.name}IOReal{
    ${motorDefinitions}
    ${debouncerDefinitions}
    ${statusSignalDefinitions}
    public ${subsystem.name}Real{
        ${motorConfigDefinitions}
        ${neutralDefinitions}
        ${tryUntilOkDefinitions}
        ${baseStatusSignalDefinitions}
    }
    
    @Override
    public void updateInputs(${subsystem.name}IOInputs inputs) {
        ${subsystem.getAllStatusUpdates()}
    }
    ${controlMethodDefinitions}
}`;
        return returnString;
    }
}