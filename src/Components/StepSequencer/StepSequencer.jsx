import React, { useState, useEffect, useRef, useContext } from "react";
import "./StepSequencer.scss";
import * as Tone from 'tone';

import kick from "../../Assets/Sounds/kick.wav";
import bassDrum from "../../Assets/Sounds/bass_drum.wav";
import clap from "../../Assets/Sounds/clap.wav";
import hat from "../../Assets/Sounds/hat.wav"; // voir les sons dans tone
import BpmContext from "../../context/bpmContext";
//import Play from "../../Components/Play/Play";
import Instrument from '../Instrument/Instrument';

function StepSequencer() {

  /*
   * -------------
   * METHODS
   * -------------
   */
  
   const generateSteps = (stepsNum = 16) => Array.from({ length: stepsNum }, () => 0);

  // ACTIVE / DEACTIVE STEPS
  const updateStep = (trackIdx, stepIdx, trackNote) => {
    Tone.context.resume(); // deal with "The AudioContext was not allowed to start."
    const newTracks = [...tracks];
    newTracks[trackIdx].steps[stepIdx] = newTracks[trackIdx].steps[stepIdx] === 0 ? 1 : 0;
    setTracks(newTracks);
    sampler.triggerAttackRelease(trackNote, 0);
  };

  const trackToSample = (tracks) => {

    const newTracks = tracks
      .filter((el) => el.type === "sampler")
      .map((el) => [el.index, el.sound]);

    return Object.fromEntries(newTracks);
  }

  /*
   * -------------
   * CONTEXT
   * -------------
   */
  
  const bpmContext = useContext(BpmContext);
  const bpm = bpmContext.dataBpm.bpm;

  /*
  * -------------
  * STATES
  * -------------
  */

  const [playing, setPlaying] = useState(false);
  const [colIndex, setColIndex] = useState(0);
  const [steps, setSteps] = useState(16);
  const [sounds, setSounds] = useState([


    //séquenceur {
//     "timeSig": "4/4",
//    "bpm": 120,
//     "tracks": [
//         [
//             { "eventType": "note", "absTime": 0, "duration": 1, "midinote": 60 },
//             { "eventType": "note", "absTime": 1, "duration": 1, "midinote": 64 },
//             { "eventType": "note", "absTime": 3, "duration": 1, "midinote": 67 },
//         ],
//         [
//             { "eventType": "note", "absTime": 0, "duration": 3, "midinote": 60 },
//         ]
//     ]
// } -> contexte -> instrument <- choisir dans le newComposant

    // note, durée

    
    {
      index: "d0",
      name: "clap",
      sound: clap,
      type: "sampler",
      duration: 0,
      steps: generateSteps(steps)
    },
    {
      index: "e0",
      name: "hat",
      sound: hat,
      type: "sampler",
      duration: 0,
      steps: generateSteps(steps)
    },
    {
      index: "c0",
      name: "kick",
      sound: kick,
      type: "sampler",
      duration: 0,
      steps: generateSteps(steps)
    },
    {
      index: "b0",
      name: "bassDrum",
      sound: bassDrum,
      type: "sampler",
      duration: 0,
      steps: generateSteps(steps)
    }
  ]);
  const [tracks, setTracks] = useState([...sounds]);
  const [sampler, setSampler] = useState(new Tone.Sampler(trackToSample(tracks)).toDestination());

  /*
   * -------------
   * REFS
   * -------------
   */

  const stepIndex = useRef(0);
  const stepsFld = useRef(steps);

  /*
   * -------------
   * HANDLERS
   * -------------
   */
  
   const handlePlaying = () => {
    setPlaying((playing) => !playing);
  };

  const handleAddTrack = (ev) => {
    ev.preventDefault();
    if(ev.target.value !== "") {
      const val = ev.target.value;
      const newTrack = [...sounds].filter( (el) => el.name === val );
      setTracks([...tracks, ...newTrack]);
      sampler.add("c0", kick);
    }
    ev.target.value = "";
  };

  const handleSteps = (ev) => {
    ev.preventDefault();
    setSteps(stepsFld.current.value);
  };

  const handleClose = (ev) => {
    ev.preventDefault();
    alert("close");
  };

  const handleRemoveTrack = (id) => {
    setTracks(tracks.filter((track) => track.index !== id));
  }

  /*
   * -------------
   * EFFECTS
   * -------------
   */
      
   // BPM
   useEffect(() => {
    if(bpm){
      Tone.Transport.bpm.value = bpm;
    }
  }, [bpm]);
  

  // START / STOP PLAYING
  useEffect(() => {
    if (playing) { Tone.Transport.start(); }
    else { Tone.Transport.stop(); }
  }, [playing]);


  //
  /* useEffect(() => {
    console.log("did mount");
    console.log(sampler);
  }, []) */


  //
  useEffect(() => {
    setTracks([...tracks].map(el => ({...el, steps: generateSteps(steps)})));
  }, [steps])


  //
  useEffect(() => {
    Tone.Transport.cancel();
    Tone.Transport.scheduleRepeat((time) => {
      tracks.forEach((track, index) => {
        const step = track.steps[stepIndex.current];
        if (step === 1) {
            sampler.triggerAttackRelease(tracks[index].index, track.duration);
        }
      });
      setColIndex(stepIndex.current);
      stepIndex.current = (stepIndex.current + 1) % steps;
    }, steps+"n");
  }, [tracks]);

  /*
  * -------------
  * RENDER
  * -------------
  */
  return (
    
      <div className="box sequencer">

        <div className="box__bar">
        <div className="box__title">Sequencer</div>
          <button className="box__close" onClick={handleClose}>X</button>
        </div>

        <div className="box__content">
          <div className="box__action">
            <div>
              <label>{steps}</label>
              <input className="box__stepsrange" type="range" min="4" max="64" step="4" ref={stepsFld} onChange={handleSteps} value={steps} />
            </div>
            <Instrument/>
          </div>
        {tracks.map((track, trackIdx) => (
          <div className="sequencer__row" key={trackIdx+"_"+track.name}>
            <div className="sequencer__sound">
              <button className="btn__removeTrack" onClick={() => {if(window.confirm('Are you sure you want to delete the track ?')){handleRemoveTrack(track.index)}}}>Remove</button>
              <span>{track.name}</span>
            </div>
            <div className="sequencer__track">
              {track.steps.map((step, stepIdx) => (
                <div
                  key={stepIdx}
                  className={`sequencer__step ${step ? "sequencer__stepmarked" : ""} ${
                    stepIdx === colIndex ? "sequencer__stepcol" : ""
                  }`}
                  onClick={() => updateStep(trackIdx, stepIdx, track.index)}
                />
              ))}
            </div>
          </div>
        ))}
        
        <div className="sequencer__controls">
          <select className="sequencer__addtrack" onChange={handleAddTrack}>
            <option value="">Add a track</option>
            {sounds.map((sound, index) => (
              <option key={index+'_'+sound} value={sound.name}>{sound.name}</option>
            ))}
          </select>
          <button className="sequencer__play" onClick={handlePlaying}>{playing ? "stop" : "play"}</button>
        </div>

        </div>

      </div>
      
    
  );
}

export default StepSequencer;