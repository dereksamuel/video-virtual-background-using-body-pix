/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import Webcam from "react-webcam";
import { useRef, useState } from 'react';

function App() {
  const [stopBucle, setStopBucle] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  function goBodySegment() {
    setStopBucle(false);

    bodyPix.load({
      multiplier: 0.75,
      stride: 32,
      quantBytes: 4
    })
      .then(net => {
        segmentationStart(net);
      })
      .catch(error => console.error("[error-model]:", error));
  };

  async function segmentationStart (net) {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const $video = webcamRef.current.video;
      const videoWidth = $video.videoWidth;
      const videoHeight = $video.videoHeight;

      // set video props
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // set canvas w and h
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
 
      while(!stopBucle) {
        // detect
        const person = await net.segmentPerson($video);

        const backgroundBlurAmount = 6;
        const edgeBlurAmount = 2;
        const flipHorizontal = true;

        // draw
        bodyPix.drawBokehEffect(
          canvasRef.current,
          $video,
          person,
          backgroundBlurAmount,
          edgeBlurAmount,
          flipHorizontal
        );
      }
    }
  };

  return (
    <>
      <Webcam ref={webcamRef} className="webcam" />
      <canvas ref={canvasRef} />
      <button onClick={goBodySegment}>blur</button>
      <button onClick={() => setStopBucle(false)}>unblur</button>
    </>
  );
}

export default App;
