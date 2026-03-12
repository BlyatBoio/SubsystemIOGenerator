function setup() {
  createCanvas(windowWidth, windowHeight);
  let subsystem1 = new Subsystem("intake");

  let intakeMotor1 = new motor(motor.x60, "intakeMotor1", subsystem1);
  intakeMotor1.addConfigValue(motorConfig.Feedback, motorConfig.FeedbackSensorSource, "FeedbackSensorSourceValue.RotorSensor")
  intakeMotor1.addLoggedVariable(motorLoggedVaraible.position).addLoggedVariable(motorLoggedVaraible.closedLoopError).addLoggedVariable(motorLoggedVaraible.velocity);

  let intakeMotor2 = new motor(motor.x44, "intakeMotor2", subsystem1);
  intakeMotor2.addConfigValue(motorConfig.Feedback, motorConfig.FeedbackSensorSource, "FeedbackSensorSourceValue.RotorSensor")
  intakeMotor2.addLoggedVariable(motorLoggedVaraible.position).addLoggedVariable(motorLoggedVaraible.closedLoopError).addLoggedVariable(motorLoggedVaraible.velocity);

  subsystem1.addMotor(intakeMotor1);
  subsystem1.addMotor(intakeMotor2);
  subsystem1.addControlMethod(new controlMethod("driveIntake", intakeMotor1, controlMethod.velocityVoltage, "velocity", false));
  subsystem1.addControlMethod(new controlMethod("driveIntake", intakeMotor2, controlMethod.velocityVoltage, "velocity", false));
  subsystem1.addConstant("String", "INTAKE_MOTOR1_ID", "12");
  subsystem1.addConstant("String", "INTAKE_MOTOR1_ID", "13");
  fileManager.saveAllFiles(subsystem1);
}

function draw() {
  background(220);
}