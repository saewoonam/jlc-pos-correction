var fs = require("fs");
var csv = require("csv");
const path = require("path");
let output_name;
let input_name;

if (process.argv.length > 2) {
  input_name = process.argv[2]

  output_name = path.dirname(input_name) + path.sep + path.basename(input_name, '.csv') + '-jlc.csv'
  console.log(output_name);
} else {
  input_name = 'input.csv';
  output_name = 'output.csv'
}
async function loadCorrections() {
  let corrections = {}
  await new Promise( (resolve) => {
    var readCorrection = fs.createReadStream('corrections.csv');
    var csvStream = csv.parse();
    console.log('load corrections')
    csvStream.on("data", function(data) {
      corrections[data[0]]=data.slice(1).map(s=>s.trim())
    })
      .on("end", function(){
        // console.log("done load corrections", corrections);
        resolve(); // exit promise
      })
      .on("error", function(error){
        console.log(error)
      })
    readCorrection.pipe(csvStream)
  });
  return corrections
}
function rotate(data, angle) {
  // console.log('rotate', data, typeof(angle))
  data[5] = Number(data[5]) + Number(angle)
  data[5] %= 360;
  return data
}
async function main() {
  // let fileContents = fs.readFileSync('jlc_pos_fixes.yaml', 'utf8');
  // let corrections = yaml.load(fileContents);
  let corrections = await loadCorrections()
  console.log('in main', corrections)
  var readStream = fs.createReadStream(input_name); // readStream is a read-only stream wit raw text content of the CSV file
  var writeStream = fs.createWriteStream(output_name); // writeStream is a write-only stream to write on the disk

  csvStream = csv.parse(); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  let line = 0;

  csvStream.on("data", function(data) {
    if (line==0) {
      // fix header
      console.log("Fix header");
      let idx = 0;
      for(let name of data) {
        console.log(name)
        name = name.replace('PosX', 'Mid X')
        name = name.replace('PosY', 'Mid Y')
        name = name.replace('Ref', 'Designator')
        name = name.replace('Rot', 'Rotation')
        name = name.replace('Side', 'Layer')
        data[idx] = name
        idx = idx + 1
        console.log(name)
      }
    }
    line = line + 1;
    if (data[1] in corrections) { // found a part that might need to be corrected
      [footprint, angle] = corrections[data[1]]
      if (data[2] == footprint) { //match footprint
        // console.log('before', data)
        data = rotate(data, angle)
        // console.log('corrected', data)
      }
    }
  })
    .on("end", function(){
      console.log("done");
    })
    .on("error", function(error){
      console.log(error)
    })
    .pipe(csv.stringify())
  // .pipe(process.stdout)
    .pipe(writeStream);

  readStream.pipe(csvStream)
}
main()
