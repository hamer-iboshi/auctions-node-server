/**
 *  Tipos de Evento:
 *  Tenta Lance  = 3
 *  Lance  = 2
 *  Inicio = 1
 *  Verifica Timer = 0
 **/

var http = require('http');
var server = require('http').Server();
var io = require('socket.io')(server);
var Redis = require('ioredis');
var redis = new Redis();
var time = 0;
var initialTime = 0;
var started = 0;
var auctionId;
var appRoot = "/var/www/html/formatura-premiada-laravel";

redis.subscribe('timer-channel');
setInterval(function(){
    if(time>0){
        time--;
        console.log("time: "+time);
    }else if(started){
        console.log("End Auction");
        time=0;
        io.emit('timer-channel' + ':' + "End", { time: time, type: 4 });
        // Fazer o node executar um comando para encerrar o leilão no laravel e mudar o estado
        var exec = require('child_process').exec;
        var cmd = 'php '+appRoot+'/artisan auction:end '+auctionId;
        exec(cmd, function(error, stdout, stderr) {
          console.log(stdout);
          console.log("errors: "+error);
          console.log("srderr: "+stderr);
        });
        process.exit(0);
    }
}, 1000);

redis.on('message', function(channel, message){
    console.log(channel, message);
    message = JSON.parse(message);
    // console.log(channel, message,"type: "+message.data.type);
    if(message.data.type == 2){
        console.log("Bid");
        time=initialTime;
        io.emit(channel + ':' + message.event, { type: message.data.type, userName: message.data.userName  });
    }else if(message.data.type == 1){
        console.log("Start Auction: "+message.data);
        initialTime=message.data.time;
        auctionId=message.data.id;
        time=initialTime;
        started = 1;
        io.emit(channel + ':' + message.event, { time: message.data.time, type: message.data.type });
    }else if(message.data.type == 3){
        console.log("Verify Time to Bid: "+time);
        io.emit(channel + ':' + message.event, { time: time, type: message.data.type, userId: message.data.userId});
    }else if(message.data.type == 0){
        console.log("Verify Time: "+time);
        io.emit(channel + ':' + message.event, { time: time, type: message.data.type, userId: message.data.userId, userName: message.data.userName});
    }
    console.log("message -> time: "+message,time);
});

server.listen(3000);

io.on('connection', function(socket){
	console.log('connection made dickhead');
});
