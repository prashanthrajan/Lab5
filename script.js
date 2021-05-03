// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById("user-image");
const ctx = canvas.getContext('2d');

const reset_button = document.querySelector("[type='reset']");
const read_button = document.querySelector("[type='button']");
const submit_button = document.querySelector("[type='submit']");

var in_img = document.getElementById("image-input");

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 400, 400);

  submit_button.disabled = false;
  read_button.disabled = true;
  reset_button.disabled = true;

  var scale = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, scale.startX, scale.startY, scale.width, scale.height);
});

// changing the image src
in_img.addEventListener('change', () => {

  const file = in_img.files[0];
  const objectURL = URL.createObjectURL(file);
  img.src = objectURL;

  var path = in_img.value;
  if (path) {
    var startIndex = (path.indexOf('\\') >= 0 ? path.lastIndexOf('\\') : path.lastIndexOf('/'));
    var filename = path.substring(startIndex);
    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
    }
  }
  img.alt = filename;

});

// when meme needs to be generated
const form = document.getElementById("generate-meme");
form.addEventListener('submit', (event) => {
  
  var top_text = document.getElementById("text-top").value;
  var bot_text = document.getElementById("text-bottom").value;

  ctx.textAlign = "center";
  ctx.font = "30px Arial";
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.fillText(top_text, 200, 50);
  ctx.fillText(bot_text, 200, 370);
  ctx.strokeText(top_text, 200, 50);
  ctx.strokeText(bot_text, 200, 370);

  submit_button.disabled = true;
  reset_button.disabled = false;
  read_button.disabled = false;

  event.preventDefault();
});

// clear form
reset_button.addEventListener('click', () => {

  submit_button.disabled = false;
  reset_button.disabled = true;
  read_button.disabled = true; 

  document.getElementById("text-top").value = "";
  document.getElementById("text-bottom").value = "";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  in_img = "";
   
});

var dd = document.getElementById("voice-selection");
dd.disabled = false;

var synth = window.speechSynthesis;
var voices = [];

// to add all the voices to the dropdown
function populateVoiceList() {

  voices = synth.getVoices();

  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    dd.appendChild(option);
  }
  dd.remove(dd[0]);
}

window.onload = populateVoiceList;
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// reading text
read_button.addEventListener('click', ()=> {
  var top_text = document.getElementById("text-top").value;
  var bot_text = document.getElementById("text-bottom").value;

  var utter_top = new SpeechSynthesisUtterance(top_text);
  var utter_bot = new SpeechSynthesisUtterance(bot_text);
  var selectedOption = dd.selectedOptions[0].getAttribute('data-name');

  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utter_top.voice = voices[i];
      utter_bot.voice = voices[i];
    }
  }

  synth.cancel();
  utter_top.volume = (v_bar.value / 100);
  utter_bot.volume = (v_bar.value / 100);
  synth.speak(utter_top);
  synth.speak(utter_bot);
});

// updating volume
const v_icon = document.getElementById('volume-group').firstElementChild;
const v_bar = document.querySelector("[type='range']");

v_bar.addEventListener('input', () => {
  if (v_bar.value >= 67) {
    v_icon.src = "icons/volume-level-3.svg";
    v_icon.alt = "Volume Level 3";
  }
  else if (v_bar.value >= 34) {
    v_icon.src = "icons/volume-level-2.svg";
    v_icon.alt = "Volume Level 2";
  }
  else if (v_bar.value >= 1) {
    v_icon.src = "icons/volume-level-1.svg";
    v_icon.alt = "Volume Level 1";
  }
  else {
    v_icon.src = "icons/volume-level-0.svg";
    v_icon.alt = "Volume Level 0";
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
