import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
import path from "path";
import os from 'os';
import fs from 'fs';
import resizeImg from 'resize-img';

let mainWindow: BrowserWindow | null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.NODE_ENV !== "production") {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "../src/renderer/index.html"));
}

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "../src/renderer/about.html"));
}

app.whenReady().then(() => {
  createMainWindow();

  //Implement Menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove mainWindow from memory on close
  mainWindow?.on('closed', () => (mainWindow = null))

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Menu Template
const menu = [
  ...(process.platform === "darwin"
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit(),
        accelerator: "CMDOrCtrl+W",
      },
    ],
  },
  ...(process.platform !== "darwin"
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

//Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer')
  resizeImage(options);
})

async function resizeImage(image: {imagePath:string, width:number, height: number, dest: string}) {
  try{
    const newPath = await resizeImg(fs.readFileSync(image.imagePath), {
      width: +image.width,
      height: +image.height
    })

    const fileName = path.basename(image.imagePath)

    //Create dest folder if not exits
    if(!fs.existsSync(image.dest)){
      fs.mkdirSync(image.dest)
    }

    //write file to destination
    fs.writeFileSync(path.join(image.dest, fileName), newPath)

    //success to renderer
    mainWindow?.webContents.send('image:done')
    //open destination folder
    shell.openPath(image.dest)
  }catch (err){
    console.log(err)
  }
}
