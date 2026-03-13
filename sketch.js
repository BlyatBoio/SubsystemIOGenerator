function setup() {
  createCanvas(windowWidth, windowHeight);
  let subsystem1 = new Subsystem("Intake");

  subsystem1.addConstant("int", "CLIMBER_MOTOR_ID", 20);
  subsystem1.addConstSant("int", "CLIMBER_ROTATION_RATIO", 45);
  subsystem1.addConstant("Angle", "CLIMBER_MAX_EXTENSION_SETPOINT ", "Rotations.of(10)");
  subsystem1.addConstant("Angle", "CLIMBER_MIN_EXTENSION_SETPOINT ", "Rotations.of(0.0");

  let climberMotor = new motor(motor.x60, "climberMotor", subsystem1, motor.positionControl);
  climberMotor.addLoggedVariable(motorLoggedVaraible.isConnected);
  climberMotor.addLoggedVariable(motorLoggedVaraible.position);
  climberMotor.addLoggedVariable(motorLoggedVaraible.supplyCurrent);
  climberMotor.addLoggedVariable(motorLoggedVaraible.closedLoopError);

  climberMotor.addConfigValue(motorConfig.Feedback, motorConfig.FeedbackSensorSource, "FeedbackSensorSourceValue.RotorSensor");
  climberMotor.addConfigValue(motorConfig.Slot0, motorConfig.KP, 0.001);
  climberMotor.addConfigValue(motorConfig.Slot0, motorConfig.KV, 0.1);
  climberMotor.setNeutralMode("NeutralModeValue.Coast");

  subsystem1.addMotor(climberMotor);

  subsystem1.addControlMethod(new controlMethod("setClimberToSetpoint", climberMotor, controlMethod.positionVoltage, "position"));

  fileManager.saveAllFiles(subsystem1);
}

function draw() {
  background(220);
}