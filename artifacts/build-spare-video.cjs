const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const scenes = JSON.parse(fs.readFileSync(path.join(__dirname, 'spare-video-scenes.json'), 'utf8'));
function chunk(id, data) { const head=Buffer.alloc(8);head.write(id,0,4,'ascii');head.writeUInt32LE(data.length,4);return Buffer.concat([head,data,data.length%2?Buffer.alloc(1):Buffer.alloc(0)]); }
function list(id, chunks) { return chunk('LIST',Buffer.concat([Buffer.from(id),...chunks])); }
const frames=scenes.flatMap((scene,i)=>Array.from({length:scene.seconds},()=>fs.readFileSync(path.join(__dirname,'spare-video-frames',`scene-${i}.jpg`))));
const largest=Math.max(...frames.map(frame=>frame.length));
const avih=Buffer.alloc(56);
avih.writeUInt32LE(1000000,0);avih.writeUInt32LE(largest,4);avih.writeUInt32LE(0x10,12);avih.writeUInt32LE(frames.length,16);avih.writeUInt32LE(1,24);avih.writeUInt32LE(largest,28);avih.writeUInt32LE(1280,32);avih.writeUInt32LE(720,36);
const strh=Buffer.alloc(56);strh.write('vids',0);strh.write('MJPG',4);strh.writeUInt32LE(1,20);strh.writeUInt32LE(1,24);strh.writeUInt32LE(frames.length,32);strh.writeUInt32LE(largest,36);strh.writeUInt32LE(0xffffffff,40);strh.writeInt16LE(1280,52);strh.writeInt16LE(720,54);
const strf=Buffer.alloc(40);strf.writeUInt32LE(40,0);strf.writeInt32LE(1280,4);strf.writeInt32LE(720,8);strf.writeUInt16LE(1,12);strf.writeUInt16LE(24,14);strf.write('MJPG',16);strf.writeUInt32LE(1280*720*3,20);
const hdrl=list('hdrl',[chunk('avih',avih),list('strl',[chunk('strh',strh),chunk('strf',strf)])]);
const idx=Buffer.alloc(frames.length*16);let offset=4;
const videoChunks=frames.map((frame,i)=>{const p=i*16;idx.write('00dc',p);idx.writeUInt32LE(0x10,p+4);idx.writeUInt32LE(offset,p+8);idx.writeUInt32LE(frame.length,p+12);const c=chunk('00dc',frame);offset+=c.length;return c;});
const body=Buffer.concat([Buffer.from('AVI '),hdrl,list('movi',videoChunks),chunk('idx1',idx)]);
const output=chunk('RIFF',body);assert.equal(output.readUInt32LE(4),output.length-8);assert.equal(frames.length,60);
const filename=path.join(__dirname,'SPARE-Arabic-Tutorial.avi');fs.writeFileSync(filename,output);
console.log(`Created ${filename}: 60 seconds, 1280x720, MJPEG video, ${(output.length/1048576).toFixed(1)} MB.`);
