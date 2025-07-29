const filePicker = require('file-picker');

class ImageCommand {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async execute() {
    const { addMessage } = this.dependencies;
    const [imagePath] = await filePicker({
      type: 'image',
      multiple: false,
    });
    if (imagePath) {
      addMessage({ sender: 'user', image: imagePath });
    }
  }
}

module.exports = ImageCommand;
