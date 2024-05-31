import express from "express";

import http from "http";

import { Server } from "socket.io";
import { fNames, lNames, avatar } from "./common/names.js";
import path from "path";

const app = express();
const server = http.createServer(app);

const io = new Server({
    cors: {
        origin: "http://localhost:3000",
    },
});

io.listen(4000);

const __dirname = path.resolve(path.dirname(""));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

let userConnected = [];

const getRandomUserName = (id) => {
    const fNameIndex = Math.floor(Math.random() * fNames.length);
    const lNameIndex = Math.floor(Math.random() * lNames.length);

    const fName = fNames[fNameIndex];
    const lName = lNames[lNameIndex];

    userConnected.push({ id, fName, lName, avatar });

    return { id, fName, lName, avatar };
};

io.on("connection", (socket) => {
    console.log("userId: ", socket.id);

    socket.emit("user connect", getRandomUserName(socket.id));

    io.emit("user connected", userConnected);

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });

    socket.on("image message", (img) => {
        console.log("render");
        io.emit("image message", img);
    });

    socket.on("disconnect", () => {
        console.log("user disconnect");
        userConnected = userConnected.filter((user) => user.id !== socket.id);
        io.emit("user disconnect", socket.id);
    });
});

server.listen(5000, () => {
    console.log("listening on *:5000");
});
