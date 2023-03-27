import { connect, MqttClient } from "mqtt";
import { StateEvent } from "./types/index.js";

const HOST_WEBSOCKET = process.env.HOST_WEBSOCKET;
const HOST_MQTT = process.env.HOST_MQTT;
const HOST_MQTT_USER = process.env.HOST_MQTT_USER;
const HOST_MQTT_PASSWORD = process.env.HOST_MQTT_PASSWORD;
const MQTT_TOPIC_THROW = "dartgame/throw";

let turnCompleted = false;
let mqttClient: MqttClient;

function connectMqtt() {
  mqttClient = connect(`mqtt://${HOST_MQTT}`, {
    username: HOST_MQTT_USER,
    password: HOST_MQTT_PASSWORD,
  });
}

function processThrow(event: StateEvent) {
  const { throws } = event.data;
  if (throws.length === 1) {
    turnCompleted = false;
  } else if (throws.length === 3) {
    turnCompleted = true;
  }

  const actualThrow = throws[throws.length - 1];
  const absoluteScoreOfLastThrow =
    actualThrow.segment.number * actualThrow.segment.multiplier;

  mqttClient.publish(
    MQTT_TOPIC_THROW,
    JSON.stringify({
      ...actualThrow.segment,
      absoluteScoreOfLastThrow,
    }),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}

function wsConnect() {
  const socket = new WebSocket(`ws://${HOST_WEBSOCKET}:3180/api/events`);

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data) as Event;

    if (data.type === "state") {
      const stateEvent = data as unknown as StateEvent;
      if (stateEvent.data.event === "Throw detected") {
        processThrow(stateEvent);
      }
    }
  });

  socket.addEventListener("error", (event) => {
    console.error(event);
  });

  socket.addEventListener("close", (event) => {
    if (event.code === 1001) {
      setTimeout(function () {
        wsConnect();
      }, 50);
    }
  });
}

connectMqtt();
wsConnect();

setInterval(() => {}, 1 << 30);
