const pce = new PCE("output");

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  var fileReader = new FileReader();
  fileReader.onload = function () {
    if (!this.result) return;
    RomChange(this.result)
  };
  fileReader.readAsArrayBuffer(file);
});
window.addEventListener(
  "resize",
  (e) => {
    resizeCanvas();
  },
  true
);
const RomChange = (arybuf) => {
	let rom;
	let u8array = new Uint8Array(arybuf);
	rom = new Array();
	for(let i=0; i<u8array.length; i++){
		rom.push(u8array[i]);
  }
	pce.SetROM(rom);
}
resizeCanvas = () => {
  setTimeout(() => {
    let canvas = document.getElementById("output");
    const wh = window.innerHeight;
    const ww = window.innerWidth;
    const nw = 320;
    const nh = 262;
    const waspct = ww / wh;
    const naspct = nw / nh;

    if (waspct > naspct) {
      var val = wh / nh;
    } else {
      var val = ww / nw;
    }
    let ctrldiv = document.querySelector(".ctrl_div");
    canvas.style.height = 262 * val - ctrldiv.offsetHeight - 18 + "px";
    canvas.style.width = 320 * val - 24 + "px";
  }, 1200);
};
resizeCanvas();