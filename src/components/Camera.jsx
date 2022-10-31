/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
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
          // const maskBackground = true;
          const backgroundColor = {r: 0, g: 255, b: 0, a: 255};
          const backgroundDarkeningMask = bodyPix.toMask(person, true, backgroundColor);
          const imageData = backgroundDarkeningMask.data;
          const opacity = 1;

          // console.log(imageData);
          // for(let i = 0; i < imageData.length; i += 4) {
          //   if (imageData[i] === 255) {

          //   }
          // }

          bodyPix.drawMask(
            canvasRef.current,
            $video,
            backgroundDarkeningMask,
            opacity,
            edgeBlurAmount,
            flipHorizontal
          );
        }
      }
    }
  };

  return (
    <>
      <Webcam ref={webcamRef} className="webcam" />
      <canvas ref={canvasRef} />
      <button onClick={() => goBodySegment("blur")}>blur</button>
      <button onClick={() => goBodySegment("image-bg")}>image-bg</button>
      <button onClick={() => setStopBucle(true)}>stop</button>
    </>
  );
}

export default Camera;
