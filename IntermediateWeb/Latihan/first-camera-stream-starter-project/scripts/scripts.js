async function startup() {
  const cameraVideo = document.getElementById('camera-video');

  function populateTakenPicture(image) {
    // TODO: show taken picture
  }

  async function getStream() {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: true,
      });
    } catch (error) {
      throw error;
    }
  }

  function cameraLaunch(stream) {
    cameraVideo.srcObject = stream;
    cameraVideo.play();
  }

  function cameraTakePicture() {
    // TODO: draw video frame to canvas
  }

  async function init() {
    try {
      const stream = await getStream();
      cameraLaunch(stream);
    } catch (error) {
      console.error(error);
      alert('Error occurred:', error.message);
    }
  }

  init();
}

window.onload = startup;