class fileManager{
    static saveAllFiles(subsystem){
        // folder path / subsytemConstants.java
        //saveStrings([this.getConstantsString(subsystem)], `${subsystem.name}/${subsystem.name}Constants`, "java");
        saveStrings([this.getRealString(subsystem)], `${subsystem.name}IOReal`, "java");
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
            motorDefinitions += subsystem.motors[i].getDefinitionAsString()+"\n\t";
            debouncerDefinitions += `${subsystem.motors[i].name}Debounce = new Debouncer(0.5);\n\t`;

            for(let j = 0; j < subsystem.motors[i].loggedVariables.length; j++){
                statusSignalDefinitions += subsystem.motors[i].loggedVariables[j].getStatusDefinition()+"\n\t\t";
            }

            motorConfigDefinitions += subsystem.motors[i].getConfigAsString()+"\n";
            neutralDefinitions += `${subsystem.motors[i].name}.setNeutralMode(${subsystem.motors[i].neutralMode});`;
            tryUntilOkDefinitions += `tryUntilOk(\n\t\t\t5,\n\t\t\t() ->${subsystem.motors[i].name}\n\t\t\t.getConfigurator()\n\t\t\t.apply(${subsystem.motors[i].name}Config, 0.25));\n`;
            baseStatusSignalDefinitions += subsystem.motors[i].getStautsSignalDefinition()+"\n\t\t";
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