const fs = require('fs')
const irsdk = require('node-irsdk-2021')
const iracing = irsdk.init({telemetryUpdateInterval: 1000})
const Govee = require("govee-lan-control");
const govee = new Govee.default();

govee.on("deviceAdded", async (device) => {
  console.log(`Device "${device.model}" has been detected`);
  device.actions.setColor({
    rgb: [0, 0, 0],
  });  

  let sessionFlags = []; // Array to store currently triggered flags
  let cautionWavingInterval;
  let greenInterval;
  let blueInterval;
  let yellowWavingInterval;
  
  iracing.on('Telemetry', function (evt) {
    const flagsToCheck = ["Checkered", "White", "Green", "Yellow", "Blue", "YellowWaving", "GreenHeld", "Caution", "CautionWaving", "Disqualify"];
    const matchingFlags = flagsToCheck.filter(flag => evt.values.SessionFlags.includes(flag));
    const newFlags = matchingFlags.filter(flag => !sessionFlags.includes(flag));
    const removedFlags = sessionFlags.filter(flag => !matchingFlags.includes(flag));
  
    newFlags.forEach(flag => {
      sessionFlags.push(flag);
      trigger_light(flag);
      console.log(`Flag "${flag}" is appearing for the first time.`);
    });
  
    removedFlags.forEach(flag => {
      sessionFlags = sessionFlags.filter(f => f !== flag);
      console.log(`Flag "${flag}" has been removed.`);
      stop_light(flag);
    });
  });
  
  function stop_light(flag) {
    if (flag === "CautionWaving") {
      clearInterval(cautionWavingInterval);
      cautionWavingInterval = undefined;
      device.actions.setColor({
        rgb: [0, 0, 0],
      });
    }

    if (flag === "YellowWaving") {
      clearInterval(yellowWavingInterval);
      yellowWavingInterval = undefined;
      device.actions.setColor({
        rgb: [0, 0, 0],
      });
    }
  
    if (flag === "Green") {
      clearInterval(greenInterval);
      greenInterval = undefined;
      device.actions.setColor({
        rgb: [0, 0, 0],
      });
    }

    if (flag === "Blue") {
      clearInterval(blueInterval);
      blueInterval = undefined;
      device.actions.setColor({
        rgb: [0, 0, 0],
      });
    }
  }
  
  let brightness = 10;
  let isIncreasing = true;
  let checkeredCount = 0;
  
  function trigger_light(flag) {
    if (flag === "CautionWaving") {
      console.log("CautionWaving");
      cautionWavingInterval = setInterval(() => {
        device.actions.setColor({
          rgb: [255, 76, 0],
        });
        device.actions.setBrightness(brightness);
  
        if (brightness === 0) {
          isIncreasing = true;
        } else if (brightness === 100) {
          isIncreasing = false;
        }
        if (isIncreasing) {
          brightness = 100;
        } else {
          brightness = 0;
        }
      }, 700);
    }

    if (flag === "YellowWaving") {
      console.log("YellowWaving");
      yellowWavingInterval = setInterval(() => {
        device.actions.setColor({
          rgb: [255, 237, 0],
        });
        device.actions.setBrightness(brightness);
  
        if (brightness === 0) {
          isIncreasing = true;
        } else if (brightness === 100) {
          isIncreasing = false;
        }
        if (isIncreasing) {
          brightness = 100;
        } else {
          brightness = 0;
        }
      }, 700);
    }
  
    if (flag === "Caution") {
      console.log("Caution");
      device.actions.setColor({
        rgb: [255, 76, 0],
      });
      device.actions.setBrightness(100);
    }

    if (flag === "Yellow") {
      console.log("Yellow");
      device.actions.setColor({
        rgb: [255, 237, 0],
      });
      device.actions.setBrightness(100);
    }
  
    if (flag === "Green") {
      greenInterval = setInterval(() => {
        device.actions.setColor({
          rgb: [0, 255, 0],
        });
        device.actions.setBrightness(brightness);
        if (brightness === 0) {
          isIncreasing = true;
        } else if (brightness === 100) {
          isIncreasing = false;
        }
        if (isIncreasing) {
          brightness = 100;
        } else {
          brightness = 0;
        }
      }, 700);
    }
    
    if(flag === "Checkered"){      
      const checkered = setInterval(() => {
        device.actions.setColor({
          rgb: [255, 255, 255],
        });
        device.actions.setBrightness(brightness);
      
        if (brightness === 0) {
          isIncreasing = true;
        } else if (brightness === 100) {
          isIncreasing = false;
        }
        if (isIncreasing) {
          brightness = 100;
        } else {
          brightness = 0;
        }
      
        checkeredCount++;
        console.log(checkeredCount);
        if (checkeredCount === 10) {
          device.actions.setColor({
            rgb: [0, 0, 0],
          });
          clearInterval(checkered); // Stop the checkered after 10 iterations
        }
      }, 700);
    }

    if (flag === "Blue") {
      console.log("Blue");
      device.actions.setColor({
        rgb: [0, 0, 255],
      });
      device.actions.setBrightness(100);
    }
  }

});


// Checkered = All White
// White = Fuck This we don't need it
// Green = Green
// Yellow = Solid Yellow
// Blue = Blue
// YellowWaving = Pulsing Yellow
// GreenHeld = Solid Green
// Caution = Solid Orange
// CautionWaving = Pulsing Orange
// Disqualify = Lights off