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

const RomChange = (arybuf) => {
	let rom;
	let u8array = new Uint8Array(arybuf);
	rom = new Array();
	for(let i=0; i<u8array.length; i++){
		rom.push(u8array[i]);
  }
	pce.SetROM(rom);
}
