
import React, { useState, useEffect, useRef, useContext } from "react";
import "./Instrument.scss";
import instrumentContext from "../../context/instrumentContext";
import Play from "../../Components/Play/Play";
import * as Tone from 'tone';
import {PlayProvider} from "../../context/playContext";


function Instrument() {

  /*
   * -------------
   * CONTEXT
   * -------------
   */
  
   const {dataInstrument, setDataInstrument} = useContext(instrumentContext);
  

   /*
   * -------------
   * STATES
   * -------------
   */

  const [inst, setInst] = useState();

  /*
   * -------------
   * METHODS
   * -------------
   */

  const changeInst = (newInst) => { 
  switch (newInst) {
        case 'Synth':
        setInst(new Tone.Synth().toDestination());
        break;
        case 'AMSynth':
        setInst(new Tone.AMSynth().toDestination());
        break;
        case 'PluckSynth':
        setInst(new Tone.PluckSynth().toDestination());
        break;
        case 'PolySynth':
        setInst(new Tone.PolySynth().toDestination());
        break;
        default:
        console.log(`Sorry bro.`);
    }
}

  /*
  * -------------
  * HANDLERS
  * -------------
  */
 
  const handleInstrument = (ev) => {
    if (ev.target.value) {
      setDataInstrument(ev.target.value);
    }
  };
  
  const handleClose = (ev) => {
    ev.preventDefault();
    alert("close");
  };

  /*
    * -------------
    * EFFECTS
    * -------------
    */

    useEffect(() => {
      changeInst(dataInstrument);
  }, [dataInstrument]);

  /*
    * -------------
    * RENDER
    * -------------
    */ 

return (
  <div className="sequencer__addtrack instrument">
      <select onChange={handleInstrument} name="" id="">
        <option value="">choose an instrument</option>
        <option value="Synth">Synth</option>
        <option value="AMSynth">AMSynth</option>
        <option value="PluckSynth">PluckSynth</option>
        <option value="PolySynth">PolySynth</option>
      </select>
      <>
      <PlayProvider value={{inst, setInst}}>
        <Play />
      </PlayProvider>
      </>
  </div>
  );
}
export default Instrument;