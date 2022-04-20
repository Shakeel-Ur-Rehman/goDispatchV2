const server = require('http').createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});
const io = require('socket.io')(server);
const axios = require('axios').default;


const store = {}


io.on('connection', client => {
  const token = getTokenFromHeaders(client)
  const header = token.split("JWT ")
  if(token){
    console.log("clinet connected")
    if(!store[header[1]]){
      store[header[1]] = client
    }
  }
  else{
    client.disconnect()
  }
  client.on('startTrip', async (data) => {
     await callApi(client,data)
  });
  client.on('disconnect', () => {
      console.log("socket disconnected")
  });
});
console.log("starting server on port 3000")
server.listen(3001);




const getTokenFromHeaders = (client)=>{
  const token =  client.handshake?.headers?.authorization
  return token
}



const callApi = async (client,tripRequestObj)=>{
  const riderID = tripRequestObj.riderId;
  const driverID = tripRequestObj.driverId;
  const res = await axios.post("http://localhost:3020/api/trips/start-trip-driver",tripRequestObj,{
    headers:{common:{Authorization:getTokenFromHeaders(client)}}
  })
  
  client.emit("tripUpdated",res.data.message)
}