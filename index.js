"use strict";
import publicIp from 'public-ip';
import http from "http"
import express from "express"
import { WebSocketServer }  from "ws"
import five from"johnny-five"
const app =  express();
const server = http.createServer(app)

class IDServer {
    constructor(port, host, name) {

        this.host = host;                                
        this.port = port;                                
        this.name = name;
        this.socket = new WebSocketServer( {server} );   
        this.app = app;                                  
        this.board = new five.Board()                    
        this.led;
        
    }
    //Start the server
    init = () => {
        let that = this
        this.socket.on('connection', (webSocketClient) => {
            //send feedback to the incoming connection
            webSocketClient.send('{ "connection" : "ok"}');
            console.log("\x1b[32m%s\x1b[0m",'connected :', webSocketClient._socket.remoteAddress)
            //when a message is received
            webSocketClient.on('message', (message) => {
                //for each websocket client
                this.socket
                    .clients
                    .forEach(client => {
                        //send the client the current message
                        client.send(`{ "message" : ${message} }`);
                    });
            });
        });

        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        
        this.app.get('/ping', async function (req, res) {
            const rAddress = req.socket.remoteAddress;
            console.log("\x1b[32m%s\x1b[0m", 'Ping request from :', rAddress);
            let data = {
                host: await publicIp.v4(),
                port: that.port,
                name: that.name
            }
            res.jsonp(data);
            return;
        });

        //start the web server
        server.listen( this.port, () => {
            console.log("\x1b[32m%s\x1b[0m", 'Listening on port :', this.port);
            this.board.on("ready", function() {
                console.log("\x1b[32m%s\x1b[0m", 'Board Ready');
                this.led = new five.Led(13);
                this.led.on()
              });
        });
    }
}
 
export default  IDServer
  