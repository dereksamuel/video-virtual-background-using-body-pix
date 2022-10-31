/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import imageHacker from "../assets/hacker-bg.jpg";
import Webcam from "react-webcam";
import { useRef, useState } from 'react';

function Camera() {
  const [stopBucle, setStopBucle] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  function goBodySegment(effect = "blur") {
    setStopBucle(false);

    bodyPix.load({
      multiplier: 0.75,
      stride: 32,
      quantBytes: 4
    })
      .then(net => {
        segmentationStart(net, effect);
      })
      .catch(error => console.error("[error-model]:", error));
  };

  async function segmentationStart (net, effect) {
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

      const context = canvasRef.current.getContext("2d");
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
 
      while(!stopBucle) {
        // detect
        const person = await net.segmentPerson($video, {
          internalResolution: "low",
        });

        const backgroundBlurAmount = 6;
        const edgeBlurAmount = 2;
        const flipHorizontal = true;

        // draw
        if (effect === "blur") {
          bodyPix.drawBokehEffect(
            canvasRef.current,
            $video,
            person,
            backgroundBlurAmount,
            edgeBlurAmount,
            flipHorizontal
          );
        } else {
          drawMask($video, net, person, context);
        }
      }
    }
  };

  async function drawMask($video, net, person, context) {
    const edgeBlurAmount = 2;
    const flipHorizontal = true;

    const mask = bodyPix.toMask(person);
    const opacity = 1;

    // create tempCanvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = $video.videoWidth;
    tempCanvas.height = $video.videoHeight;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.putImageData(mask, 0, 0);
    canvasRef.current.style = `background: url(${imageHacker})`;
    context.drawImage($video, 0, 0, canvasRef.current.width, canvasRef.current.height);
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.drawImage(tempCanvas, 0, 0, canvasRef.current.width, canvasRef.current.height);
    context.restore();
  }

  return (
    <>
      <Webcam ref={webcamRef} className="webcam" />
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>
      <button onClick={() => goBodySegment("blur")}>blur</button>
      <button onClick={() => goBodySegment("image-bg")}>image-bg</button>
      {/* <button onClick={() => setStopBucle(true)}>stop</button> */}
    </>
  );
}

export default Camera;
