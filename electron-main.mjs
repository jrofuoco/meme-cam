import {app,BrowserWindow} from 'electron';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
let server;

function createWindow(){
 const win=new BrowserWindow({width:1440,height:980,minWidth:900,minHeight:650,backgroundColor:'#101211',webPreferences:{backgroundThrottling:false}});
 win.webContents.setBackgroundThrottling(false);
 win.loadURL('http://127.0.0.1:5173/?desktop=1');
}

app.whenReady().then(()=>{
 server=spawn(process.execPath,[path.join(here,'server.mjs')],{cwd:here,stdio:'ignore',windowsHide:true});
 setTimeout(createWindow,350);
 app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
});
app.on('window-all-closed',()=>{if(server)server.kill();if(process.platform!=='darwin')app.quit();});
app.on('before-quit',()=>server?.kill());
