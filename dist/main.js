"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const resize_img_1 = __importDefault(require("resize-img"));
let mainWindow;
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        title: "Image Resizer",
        width: 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path_1.default.join(__dirname, 'preload.js')
        }
    });
    if (process.env.NODE_ENV !== "production") {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile(path_1.default.join(__dirname, "../src/renderer/index.html"));
}
function createAboutWindow() {
    const aboutWindow = new electron_1.BrowserWindow({
        title: "About Image Resizer",
        width: 300,
        height: 300,
    });
    aboutWindow.loadFile(path_1.default.join(__dirname, "../src/renderer/about.html"));
}
electron_1.app.whenReady().then(() => {
    createMainWindow();
    //Implement Menu
    const mainMenu = electron_1.Menu.buildFromTemplate(menu);
    electron_1.Menu.setApplicationMenu(mainMenu);
    // Remove mainWindow from memory on close
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.on('closed', () => (mainWindow = null));
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});
// Menu Template
const menu = [
    ...(process.platform === "darwin"
        ? [
            {
                label: electron_1.app.name,
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
                click: () => electron_1.app.quit(),
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
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
//Respond to ipcRenderer resize
electron_1.ipcMain.on('image:resize', (e, options) => {
    options.dest = path_1.default.join(os_1.default.homedir(), 'imageresizer');
    resizeImage(options);
});
function resizeImage(image) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newPath = yield (0, resize_img_1.default)(fs_1.default.readFileSync(image.imagePath), {
                width: +image.width,
                height: +image.height
            });
            const fileName = path_1.default.basename(image.imagePath);
            //Create dest folder if not exits
            if (!fs_1.default.existsSync(image.dest)) {
                fs_1.default.mkdirSync(image.dest);
            }
            //write file to destination
            fs_1.default.writeFileSync(path_1.default.join(image.dest, fileName), newPath);
            //success to renderer
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('image:done');
            //open destination folder
            electron_1.shell.openPath(image.dest);
        }
        catch (err) {
            console.log(err);
        }
    });
}
