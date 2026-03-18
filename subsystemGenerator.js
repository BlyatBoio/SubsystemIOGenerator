function getSubsystem(){
    let newSubsystem = new Subsystem(subsystemTitleInput.value());

    for(let m of motorValueSaves){
        let newMotor = new motor(m.getValue("x44")?motor.x44:motor.x60, m.name, newSubsystem, m.getValue("Position Controlled")?controlMethod.positionVoltage:controlMethod.velocityVoltage);

        if(m.getValue("SupplyCurrentLimit")!=0 && m.getValue("SupplyCurrentLimit")!=undefined) newMotor.addConfigValue(motorConfig.CurrentLimits, motorConfig.SupplyCurrentLimit, m.getValue("SupplyCurrentLimit"));
        if(m.getValue("StatorCurrentLimit")!=0 && m.getValue("StatorCurrentLimit")!=undefined) newMotor.addConfigValue(motorConfig.CurrentLimits, motorConfig.StatorCurrentLimit, m.getValue("StatorCurrentLimit"));
        if(m.getValue("KP")!=0 && m.getValue("KP")!=undefined) newMotor.addConfigValue(motorConfig.Slot0, motorConfig.KP, m.getValue("KP"));
        if(m.getValue("KS")!=0 && m.getValue("KS")!=undefined) newMotor.addConfigValue(motorConfig.Slot0, motorConfig.KS, m.getValue("KS"));
        if(m.getValue("KV")!=0 && m.getValue("KV")!=undefined) newMotor.addConfigValue(motorConfig.Slot0, motorConfig.KV, m.getValue("KV"));
        if(m.getValue("SensorToMechanismRatio")!=0 && m.getValue("SensorToMechanismRatio")!=undefined) newMotor.addConfigValue(motorConfig.Feedback, motorConfig.SensorToMechanismRatio, m.getValue("SensorToMechanismRatio"));
        if(m.getValue("Inverted")) newMotor.addConfigValue(motorConfig.MotorOutput, motorConfig.Inverted, "InvertedValue.CounterClockwise_Positive");

        if(m.getValue("Position")) newMotor.addLoggedVariable(motorLoggedVaraible.position);
        if(m.getValue("Velocity")) newMotor.addLoggedVariable(motorLoggedVaraible.velocity);
        if(m.getValue("PositionClosedLoopError")) newMotor.addLoggedVariable(motorLoggedVaraible.positionClosedLoopError);
        if(m.getValue("VelocityClosedLoopError")) newMotor.addLoggedVariable(motorLoggedVaraible.velocityClosedLoopError);
        if(m.getValue("SupplyCurrent")) newMotor.addLoggedVariable(motorLoggedVaraible.supplyCurrent);
        if(m.getValue("Connected")) newMotor.addLoggedVariable(motorLoggedVaraible.isConnected);
        if(m.getValue("Temperature")) newMotor.addLoggedVariable(motorLoggedVaraible.temperature);

        if(m.getValue("CAN ID")!=0&&m.getValue("CAN ID")!=undefined) newSubsystem.addConstant("int", m.name.toUpperCase()+"_MOTOR_ID", m.getValue("CAN ID"));

        newSubsystem.addMotor(newMotor);
    }

    for(let c of constantSave.values){
        newSubsystem.addConstant("String", c[0], c[1]);
    }
    return newSubsystem;
}