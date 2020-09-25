import React, { useState, useEffect, useRef, useContext } from "react";
import "./StepSequencer.scss";
import * as Tone from 'tone';

import kick from "../../Assets/Sounds/kick.wav";
import bassDrum from "../../Assets/Sounds/bass_drum.wav";
import clap from "../../Assets/Sounds/clap.wav";
import hat from "../../Assets/Sounds/hat.wav"; // voir les sons dans tone
import BpmContext from "../../context/bpmContext";
//import Play from "../../Components/Play/Play";
import StepSeqContext from "../../context/stepSequencerContext";
import Instrument from '../Instrument/Instrument';

function StepSequencer() {

  /*
   * -------------
   * METHODS
   * -------------
   */

  // Il faut qu'il y ai la gestion des 1
  const generateSteps = (stepsNum = 16) => Array.from({ length: stepsNum }, () => 0);

  // ACTIVE / DEACTIVE STEPS
  const updateStep = (trackIdx, stepIdx, trackNote) => {
    Tone.context.resume();
    const newTracks = [...tracks];
    if(trackNote !== null){
      const newNotes = dataTracks.notes.push(
        {
          name:trackNote,
          duration: 0,
          time: (60 / bpm) * stepIdx,
          steps:stepIdx
        }
      )
      setDataTracks({...dataTracks, newNotes});
    }
    newTracks[trackIdx].steps[stepIdx] = newTracks[trackIdx].steps[stepIdx] === 0 ? 1 : 0;
    setdataStepSeq({ ...dataStepSeq, tracks: newTracks });
    instru.triggerAttackRelease(trackNote, 0.2);
  };

  /*
   * -------------
   * CONTEXT
   * -------------
   */

  const bpmContext = useContext(BpmContext);
  const bpm = bpmContext.dataBpm.bpm;
  let midi;
  // console.log("bpm", bpmContext);

  const { dataStepSeq, setdataStepSeq } = useContext(StepSeqContext);
  const { dataTracks, setDataTracks } = useContext(StepSeqContext);
  const notesList = dataStepSeq.notesList;
  const tracks = Array.isArray(dataStepSeq.tracks) && dataStepSeq.tracks.length ? dataStepSeq.tracks : [];
  const steps = dataStepSeq.stepsNum;

  /*
  * -------------
  * STATES
  * -------------
  */

  const [playing, setPlaying] = useState(false);
  const [colIndex, setColIndex] = useState(0);
  const [instru, setInstru] = useState(new Tone.Synth().toDestination());

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
    if (ev.target.value !== "") {
      const note = ev.target.value;
     /*  midi = document.querySelector(".test").getAttribute('name') */
      const newTrack = { name: note, duration: 0, steps: generateSteps(steps) };
      setdataStepSeq({ ...dataStepSeq, tracks: [...dataStepSeq.tracks, newTrack] });
      console.log("a",dataStepSeq,"b",dataStepSeq.tracks)
    }
    ev.target.value = "";
  };



  const handleSteps = (ev) => {
    ev.preventDefault();
    setdataStepSeq({ ...dataStepSeq, stepsNum: stepsFld.current.value });
  };

  const handleClose = (ev) => {
    ev.preventDefault();
    //alert("close");
    notesList.map((note, index) => tracks.map(el => el.name).includes(note.name) === true && console.log('ok'));
  };

  const handleRemoveTrack = (name) => {
    setdataStepSeq({ ...dataStepSeq, tracks: tracks.filter((track) => track.name !== name) });
    //setTracks();
  }

  /*
   * -------------
   * EFFECTS
   * -------------
   */

  // BPM
  useEffect(() => {
    if (bpm) {
      Tone.Transport.bpm.value = bpm;
    }
  }, [bpm]);


  // START / STOP PLAYING
  useEffect(() => {
    if (playing) { Tone.Transport.start(); }
    else { Tone.Transport.stop(); }
  }, [playing]);


  //
  useEffect(() => {
    const newTracks = [...tracks].map(el => ({ ...el, steps: generateSteps(steps) }));
    setdataStepSeq({ ...dataStepSeq, tracks: newTracks });
  }, [steps])


  //
 /*  useEffect(() => {
    Tone.Transport.cancel();
    Tone.Transport.scheduleRepeat((time) => {
      tracks.forEach((track, index) => {
        const step = track.steps[stepIndex.current];
        if (step === 1) {
          instru.triggerAttackRelease(tracks[index].name, 0.2);
        }
      });
      setColIndex(stepIndex.current);
      stepIndex.current = (stepIndex.current + 1) % steps;
    }, steps + "n");
  }, [tracks]); */

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
        <div className="sequencer__controls">
          <div>
            <label>{steps}</label>
            <input className="box__stepsrange" type="range" min="4" max="64" step="4" ref={stepsFld} onChange={handleSteps} value={steps} />
          </div>
          <Instrument />
        </div>
        {tracks.map((track, trackIdx) => (

          <div className="sequencer__row" key={trackIdx + "_" + track.name}>
            <div className="sequencer__sound">
              <button className="btn__remove" onClick={() => { if (window.confirm('Are you sure you want to delete the track ?')) { handleRemoveTrack(track.name) } }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#a7080b" width="24px" height="24px"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
              <span>{track.name}</span>
            </div>
            <div data-step={steps} className="sequencer__track">
              {track.steps.map((step, stepIdx) => (
                <div
                  key={stepIdx}
                  className={`sequencer__step ${step ? "sequencer__stepmarked" : ""} ${stepIdx === colIndex ? "sequencer__stepcol" : ""
                    }`}
                  onClick={() => updateStep(trackIdx, stepIdx, track.name)}
                />
              ))}
            </div>
          </div>
        ))}

        {<div className="sequencer__controls">
          <select className="sequencer__addtrack" onChange={handleAddTrack}>
            <option value="">Add a track</option>
            {notesList.map((note, index) =>
              tracks.map(el => el.name).includes(note.name) === false &&
              <option key={index + '_' + note.name} value={note.name} name={note.midi}>{note.name}</option>
            )}
          </select>
          {/* <button className="sequencer__play" onClick={handlePlaying}>{playing ? "stop" : "play"}</button> */}
        </div>}

      </div>

    </div>


  );
}

export default StepSequencer;