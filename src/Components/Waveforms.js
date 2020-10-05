import React, { useEffect, useRef, useState } from "react";

import WaveSurfer from "wavesurfer.js";

const formWaveSurferOptions = (ref) => ({
  container: ref,
  waveColor: "rgba(255,255,255,0.2)",
  progressColor: "rgba(0,0,0,0.4)",
  cursorColor: "transparent",
  barWidth: 1,
  barRadius: 0,
  responsive: true,
  height: 100,
  normalize: true,
  partialRender: true
});

export default function Waveform({ url, id }) {
  console.log(url);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [playing, setPlay] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // create new WaveSurfer instance
  // On component mount and when url changes
  useEffect(() => {
    setPlay(false);

    const options = formWaveSurferOptions(waveformRef.current);
    wavesurfer.current = WaveSurfer.create(options);

    wavesurfer.current.load(url);

    wavesurfer.current.on("ready", function () {
      // https://wavesurfer-js.org/docs/methods.html
      // wavesurfer.current.play();
      // setPlay(true);

      // make sure object stillavailable when file loaded
      if (wavesurfer.current) {
        wavesurfer.current.setVolume(volume);
        setVolume(volume);
      }
    });

    wavesurfer.current.on("finish", function () {
      setPlay(false);
      wavesurfer.current.seekTo(0);
    });

    // Removes events, elements and disconnects Web Audio nodes.
    // when component unmount
    return () => wavesurfer.current.destroy();
  }, []);

  const handlePlayPause = () => {
    setPlay(!playing);
    wavesurfer.current.playPause();
  };

  return (
    <div className="waveform">
      <div id={`waveform_${id}`} className="waveform__waves" ref={waveformRef} />
      <div className="control">
        <button onClick={handlePlayPause}>{!playing ? "Play" : "Pause"}</button>
      </div>
    </div>
  );
}