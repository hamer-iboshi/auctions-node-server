/**
 *  Tipos de Evento:
 *  Lance  = 2
 *  Inicio = 1
 *  Verifica Timer = 0
 **/

// var app = require('express')();
var server = require('http').Server();
var io = require('socket.io')(server);
var Redis = require('ioredis');
var redis = new Redis();
var time = 0;
redis.subscribe('timer-channel');
setInterval(function(){
    if(time>0){
        time--;
        console.log("time: "+time);
    }
}, 1000);

redis.on('message', function(channel, message){
    console.log(channel, message);
    message = JSON.parse(message);
    // console.log(channel, message,"type: "+message.data.type);
    if(message.data.type == 2){
        console.log("Bid");
        time=message.data.time;
        io.emit(channel + ':' + message.event, { time: message.data.time, type: message.data.type });
    }else if(message.data.type == 1){
        console.log("Start Auction");
        time=message.data.time;
        io.emit(channel + ':' + message.event, { time: message.data.time, type: message.data.type });
    }else if(message.data.type == 0){
        console.log("Verify Time: "+time,"id: "+message.data.id,"type: "+message.data.type);
        io.emit(channel + ':' + message.event, { time: time, type: message.data.type, id: message.data.id});
    }else if(message.data.type == 4){
        console.log("End Auction");
        time=0;
        io.emit(channel + ':' + message.event, { time: message.data.time, type: message.data.type });
    }
    console.log("message -> time: "+message,time);
});

// redis.subscribe('timer-channel');
//
// redis.on('message', function(channel, message){
//     console.log(channel, message);
//     message = JSON.parse(message);
//     // message = JSON.parse(message);
//     // console.log(message);
//     io.emit(channel + ':' + message.event, message.data, this.time); //test-channel:EventoTeste
// });


server.listen(3000);

io.on('connection', function(socket){
	console.log('connection made dickhead');
});
