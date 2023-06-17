import React, { useState, createRef, useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const cigpack =
  "https://bafybeigvhgkcqqamlukxcmjodalpk2kuy5qzqtx6m4i6pvb7o3ammss3y4.ipfs.dweb.link/2836.jpg";
const defaultStamp = "/lutgin.png";

export const Stamp = () => {
  const [image, setImage] = useState(defaultStamp);
  const cropperRef = createRef(null);
  const canvasRef = useRef(null);

  const combineImages = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Load the first image
    const img1 = new Image();
    img1.src = cigpack;

    img1.onload = () => {
      // Draw the first image on the canvas
      const cigWidth = img1.width;
      const cigHeight = img1.height;
      canvas.width = cigWidth;
      canvas.height = cigHeight;
      ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);
      console.log(canvas);

      // Get the cropped image from the Cropper component
      const croppedImage = cropperRef.current?.cropper
        .getCroppedCanvas()
        .toDataURL();

      // Load the cropped image
      const img2 = new Image();
      img2.src = croppedImage;

      img2.onload = () => {
        // Draw the second image on the canvas
        ctx.setTransform(1.2, -0.18, -0.02, 1.49, 0, 0);
        ctx.drawImage(img2, 980, 1100, 1160, 960);
      };
    };
  };

  const onChange = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(files[0]);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <div style={{ flexBasis: "50%", padding: "10px" }}>
        <div style={{ marginBottom: "10px" }}>
          <input type="file" onChange={onChange} />
        </div>
        <Cropper
          ref={cropperRef}
          initialAspectRatio={1}
          src={image}
          viewMode={1}
          minCropBoxHeight={10}
          minCropBoxWidth={10}
          background={false}
          responsive={true}
          autoCropArea={1}
          checkOrientation={false}
          guides={false}
        />
      </div>
      <div style={{ flexBasis: "50%", padding: "10px" }}>
        <div style={{ marginBottom: "10px" }}>
          <button onClick={combineImages}>Stamp it!</button>
        </div>
        <canvas ref={canvasRef} style={{ width: "100%" }} />
      </div>
    </div>
  );
};
