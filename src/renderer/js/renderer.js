const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);

function loadImage(e) {
  const file = e.target.files[0];
  if (!isFileImage(file)) {
    alertError("Please select an image");
    return;
  }

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  filename.innerHTML = file.name;
  outputPath.innerText = path.join(os.homedir(), "image_resizer");
}

function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imagePath = img.files[0].path;

  if (!img.files[0]) {
    alertError("please upload an image.");
    return;
  }

  if (width === "" || height === "") {
    alertError("please fill in a height and width.");
    return;
  }

  // Send to main using IPC Renderer
  IpcRenderer.send("image:resize", {
    imagePath,
    width,
    height,
  });
}

function isFileImage(file) {
  const acceptedImageFiles = ["image/gif", "image/png", "image/jpeg"];
  return file && acceptedImageFiles.includes(file["type"]);
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

//Catch the image:done event
ipcRenderer.on('image:done', () => {
    alertSuccess(`Image successfully resized to ${widthInput.value} x ${heightInput.value}  `)
})