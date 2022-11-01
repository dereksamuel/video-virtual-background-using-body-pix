/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import imageHacker from "../assets/hacker-bg.jpg";
import Webcam from "react-webcam";
import { useEffect, useRef, useState } from 'react';

function Camera() {
  const [stopBucle, setStopBucle] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [net, setNet] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  function goBodySegment() {
    setStopBucle(false);
    bodyPix.load({
      multiplier: 0.75,
      stride: 32,
      quantBytes: 4
    })
      .then(localNet => {
        setNet(localNet);
      })
      .catch(error => console.error("[error-model]:", error));
  };

  async function segmentationStart(effect = "blur") {
    setLoading(true);
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
 
      while(!stopBucle) {
        // detect
        const person = await net.segmentPerson($video, {
          internalResolution: "low",
        });
        setLoading(false);

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
          drawMask($video, person, context);
        }
      }
    }
  };

  async function drawMask($video, person, context) {
    const mask = bodyPix.toMask(person);

    // create tempCanvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = $video.videoWidth;
    tempCanvas.height = $video.videoHeight;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.putImageData(mask, 0, 0);
    canvasRef.current.style = `background: url(${url || imageHacker})`;
    context.drawImage($video, 0, 0, canvasRef.current.width, canvasRef.current.height);
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.drawImage(tempCanvas, 0, 0, canvasRef.current.width, canvasRef.current.height);
    context.restore();
  }

  const onChangeImage = (event) => {
    setUrl(URL.createObjectURL(event.target.files[0]));
  };

  useEffect(() => {
    goBodySegment();
  }, []);

  return (
    <>
      <Webcam ref={webcamRef} className="webcam" />
      <div className="canvas-container">
        {loading && <p className="loading">Loading</p>}
        <canvas ref={canvasRef} />
      </div>
      <div className="filters">
        <label>
          <p>blur filter:</p>
          <button onClick={() => segmentationStart("blur")}>blur</button>
        </label>
        <label>
          <p>image filter:</p>
          <input type="file" onChange={onChangeImage} />
          <button onClick={() => segmentationStart("bg-image")} disabled={!url}>Apply filter</button>
        </label>
      </div>
      {/* <button onClick={() => setStopBucle(true)}>stop</button> */}
    </>
  );
}

export default Camera;
