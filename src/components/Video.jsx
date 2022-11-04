import React, { useEffect } from 'react';
import vidbg from 'vidbg.js';

const Video = () => {
  useEffect(() => {
    const instance = new vidbg(
      ".vidbg-box",
      {
        webm: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", // URL or relative path to webm video
        overlay: false, // Boolean to display the overlay or not
        overlayColor: "#000", // The overlay color as a HEX
        overlayAlpha: 0.3, // The overlay alpha. Think of this as the last integer in RGBA()
      },
    );

    instance.playVideo();
  }, []);

  return (
    <div>
      <video autoPlay controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" className='vidbg-box' />
    </div>
  );
}

export default Video;
