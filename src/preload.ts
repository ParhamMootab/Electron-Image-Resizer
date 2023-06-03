import { contextBridge, ipcRenderer } from "electron";
import path from "path";
import os from "os";
import Toastify from 'toastify-js';

contextBridge.exposeInMainWorld("os", {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld("path", {
  join: (...args: any) => path.join(...args)
});

contextBridge.exposeInMainWorld('Toastify', {
    toast: (options: any) => Toastify(options).showToast()
})

contextBridge.exposeInMainWorld('IpcRenderer', {
    send: (channel: any, data: any) => ipcRenderer.send(channel, data),
    on: (channel: any, func:any) => ipcRenderer.on(channel, (event, ...args) => func(...args))
})
