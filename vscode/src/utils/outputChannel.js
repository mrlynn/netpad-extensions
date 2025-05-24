const vscode = require('vscode');
let channel = null;

function getOutputChannel() {
  if (!channel) {
    channel = vscode.window.createOutputChannel('NetPad');
  }
  return channel;
}

function showOutput(message) {
  const channel = getOutputChannel();
  channel.appendLine(message);
  channel.show();
}

module.exports = { showOutput };