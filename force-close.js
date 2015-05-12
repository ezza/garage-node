// Closes the relay in the event it is stuck open

gpio = require('pi-gpio');
pin = 11;

gpio.write(pin, 1);
gpio.close(pin);
