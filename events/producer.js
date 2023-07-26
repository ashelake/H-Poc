/* importing package dependencies */
const { Kafka } = require('kafkajs')

//Define the subscriber ID (kafka will know who's producing the messages)
const clientId = "ZV_Server" //Subscriber ID

//Broker list that can access the cluster
const brokers = ["18.60.249.165:49092",]

//Topic

const kafka = new Kafka({
  clientId: clientId, // should be unique based on client
  brokers: ["18.60.249.165:49092"], //"18.60.249.165:49092", "localhost:7000"
  ssl: false
})

//create producer
const producer = kafka.producer()

const produce = async (db_name, module_name, msg, created_by, date, legal_name, ip_address, event_data) => {
  let args = [{
    module_name: module_name,
    event_name: msg,
    executed_by: created_by,
    executed_date: date,
    remarks: legal_name,
    ip_address: ip_address,
    event_data: event_data,
    db_name: db_name
  }]
  console.log("args", args)
  let topicMessages = [
    {
      topic: 'Logger-Topic',
      acks: 1,
      messages: [{
        key: "key",
        value: JSON.stringify(args)
      }]

    }
  ]
  await producer.connect()
  await producer.sendBatch({ topicMessages })
  await producer.disconnect()

}

/*exporting module for the global usage */
module.exports = produce;