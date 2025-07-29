const filePicker = require('file-picker');

class ImageCommand {
  constructor(aider) {
    this.aider = aider;
  }

  async execute() {
    const [imagePath] = await filePicker({
      type: 'image',
      multiple: false,
    });
    if (imagePath) {
      this.aider.addMessage({ sender: 'user', image: imagePath });
    }
  }
}

module.exports = ImageCommand;
