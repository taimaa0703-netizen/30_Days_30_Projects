// DROP ALERT — Day 09 prototype
// Water sensor: S -> A0, + -> 5V, - -> GND
// Green LED: D8 -> 220 ohm -> LED anode; cathode -> GND
// Red LED: D9 -> 220 ohm -> LED anode; cathode -> GND
// Active buzzer: + -> D10, - -> GND (small low-current module only)
// Calibration: inspect dry/wet values in Serial Monitor, adjust WET_THRESHOLD.
const int SENSOR_PIN=A0, GREEN_PIN=8, RED_PIN=9, BUZZER_PIN=10;
const int WET_THRESHOLD=300; // EXAMPLE ONLY; calibrate for your sensor
const int HYSTERESIS=40;
const unsigned long SAMPLE_MS=500;
const unsigned long CONFIRM_MS=1500;
unsigned long lastSample=0, wetSince=0;
bool alarm=false;
void setup(){
  Serial.begin(9600);
  pinMode(GREEN_PIN,OUTPUT); pinMode(RED_PIN,OUTPUT); pinMode(BUZZER_PIN,OUTPUT);
  digitalWrite(GREEN_PIN,HIGH);
}
void loop(){
  unsigned long now=millis();
  if(now-lastSample<SAMPLE_MS) return;
  lastSample=now;
  int reading=analogRead(SENSOR_PIN);
  if(!alarm){
    if(reading>=WET_THRESHOLD){
      if(wetSince==0) wetSince=now;
      if(now-wetSince>=CONFIRM_MS) alarm=true;
    }else wetSince=0;
  }else if(reading<WET_THRESHOLD-HYSTERESIS){
    alarm=false; wetSince=0;
  }
  digitalWrite(GREEN_PIN,!alarm);
  digitalWrite(RED_PIN,alarm);
  // Pulsed alarm for active buzzer
  digitalWrite(BUZZER_PIN,alarm && (now/500)%2==0);
  Serial.print("{\"water\":"); Serial.print(reading);
  Serial.print(",\"leak\":"); Serial.print(alarm?"true":"false");
  Serial.println("}");
}
