const http=require('http');
const app=require('./index');

const port=process.env.PORRT || 3000;
const server =http.createServer(app);

server.listen(port,()=>{
    console.log(`startes on port ${port}`)
})