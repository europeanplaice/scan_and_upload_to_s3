var AWS = require("aws-sdk");
var fs = require('fs');
var s3 = new AWS.S3();
var chokidar = require('chokidar');

let config = {
  content: JSON.parse(fs.readFileSync("./config.json")),
  get getter() {
    return this.content;
  },
  set setter(obj) {
    let previous_wait = this.content["wait"];
    if (previous_wait == true && obj["wait"] == false && config.getter["waiting_item"] != null) {
      if (!this.content["do_not_upload"]) {
        console.log("Run upload because we have an waiting item.")
        upload_to_s3(waiting_item, config.getter["save_as_path"]);
      } else {
        console.log("We have an waiting item, but don't have an permisson.")
      }
    }
    this.content = obj;
    console.log(JSON.stringify(config))
  }
}
console.log(JSON.stringify(config))

chokidar.watch('./config.json').on('change', (_event, _path) => {
  try {
    config.setter = JSON.parse(fs.readFileSync("./config.json"))
  } catch { return }
  console.log("config changed")
});

chokidar.watch(config.getter["dir_to_save"]).on('add', (path) => {
  console.log("file detected")
  if (config.getter["wait"]) {
    config.getter["waiting_item"] = path.toString();
    console.log("add " + config.getter["waiting_item"] + " to waiting item")
  } else {
    if (!config.getter["do_not_upload"]) {
      console.log("Run upload because we found an new item.")
      upload_to_s3(waiting_item, config.getter["save_as_path"]);
    } else {
      console.log("We found an new item, but don't have an permisson.")
    }
  }
}
);

function upload_to_s3(source, target) {
  var params = {
    Bucket: config.getter["bucket"],
    Key: target,
    StorageClass: "INTELLIGENT_TIERING",
    Tagging: ''
  }
  while (true) {
    try {
      var v = fs.readFileSync(source);
      break;
    } catch { }
  }
  params.Body = v;
  s3.putObject(params, (err, data) => {
    if (err) { console.log(err, err.stack); }
    else {
      console.log(data);
      try {
        fs.unlinkSync(source);
        console.log('Finished unlink');
      } catch (error) {
        throw error;
      }
    }
  });
}

