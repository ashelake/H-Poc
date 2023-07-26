/* importing package dependencies */
const { Kafka, logLevel } = require("kafkajs");

// the subscriber ID lets kafka know who's producing the messages
const subscriberId = "zmserver";
// we can define the list of brokers in the cluster
// const brokers = ["13.233.102.135:49092"];
const brokers = ["18.60.249.165:49092"];
// this is the topic to which we want to write messages
const topic = "general-topic";

// initialize a new kafka subscriber and initialize a producer from it
const kafka = new Kafka({
  //logLevel: logLevel.DEBUG,
  subscriberId, brokers });
const producer = kafka.producer();

// we define an async function that writes a new message each second
const produce = async (eventName,args) => {
  await producer.connect();
  let i = 0;

  try {
    // send a message to the configured topic with
    // the key and value formed from the current value of `i`
    await producer.send({
      topic,
      acks: 1,
      messages: [
        {
          key: eventName,
          value: JSON.stringify(args),
        },
      ],
    });

    // if the message is written successfully, log it and increment `i`
    console.log("writes: ", JSON.stringify(args));
  } catch (err) {
    console.error("could not write message " + err);
  }
};

/*exporting module for the global usage */
module.exports = produce;
