var AWS = require("aws-sdk");
var fs = require('fs');
var s3 = new AWS.S3();
var chokidar = require('chokidar');
var path = require('path');
var glob = require('glob');

class State {
  constructor(folder_watcher, config_watcher, config) {
    this.folder_watcher = folder_watcher;
    this.config_watcher = config_watcher;
    this.config = config;
  }
};

function find_files_on_folder(obj) {
  files = glob.sync(path.posix.join("./", obj["dir_to_save"], "/*"))
  if (files.length == 1) {
    return files[0]
  } else {
    return null
  }
}

async function make_initial_state() {
  let config = JSON.parse(fs.readFileSync("./config.json"))

  let config_watcher = chokidar.watch('./config.json');

  config_watcher.on('change', (_event, _path) => {
    try {
      config = JSON.parse(fs.readFileSync("./config.json"))
      state.config = config
      console.log(state.config)
      let file = find_files_on_folder(config)
      if (!file) {
        return
      }
      console.log('file detected ' + file)
      if (state.config["wait"]) {
        console.log('waiting')
      } else {
        console.log('go upload')
        upload_to_s3(file, state)
      }
    } catch { return }
  });

  let dir_watcher = chokidar.watch(config["dir_to_save"]);

  dir_watcher.on('add', (path) => {
    if (state.config["wait"]) {
      console.log('waiting')
    } else {
      console.log('go upload')
      upload_to_s3(path, state)
    }
  });

  let state = new State(dir_watcher, config_watcher, config);
  console.log(config)

  return state;
}

let state = make_initial_state()

function upload_to_s3(source, state) {
  let target = state.config["save_as_path"]
  target = path.posix.format({
    dir: path.dirname(target),
    name: path.basename(target, path.extname(target)),
    ext: path.extname(source),
  })
  var params = {
    Bucket: state.config["bucket"],
    Key: target,
    StorageClass: "INTELLIGENT_TIERING",
    Tagging: ''
  }
  while (true) {
    try {
      var v = fs.readFileSync(source);
      break;
    } catch(err) {
      console.log(err)
    }
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

