function setup() {
  createCanvas(windowWidth, windowHeight);
  let subsystem1 = new Subsystem();
  let intakeMotor = new motor(motor.x60, "intakeMotor", subsystem1);
  intakeMotor.addConfigValue(motorConfig.Feedback, motorConfig.FeedbackSensorSource, "FeedbackSensorSourceValue.RotorSensor")
  intakeMotor.addLoggedVariable(motorLoggedVaraible.position).addLoggedVariable(motorLoggedVaraible.closedLoopError).addLoggedVariable(motorLoggedVaraible.velocity);
  subsystem1.addMotor(intakeMotor);
  subsystem1.addControlMethod(new controlMethod("driveIntake", intakeMotor, controlMethod.velocityVoltage, "velocity", false));
  subsystem1.addConstant("String", "INTAKE_MOTOR_ID", "12");
  fileManager.saveAllFiles();
}

function draw() {
  background(220);
}