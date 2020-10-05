import React, { useState, useEffect, useRef, useContext } from "react";
import "./Tracker.scss";
// import * as Tone from 'tone';
import trackerContext from "../../context/trackerContext";
import { TrackerProvider } from "../../context/trackerContext";
import DragDrop from "../DragDrop/DragDrop";
import Card from "../DragDrop/Card";
import DragDropContext, { DragDropProvider } from "../../context/dragDropContext";
import * as Tone from 'tone';
import kick from "../../Assets/Sounds/kick.wav";
import bassDrum from "../../Assets/Sounds/bass_drum.wav";
import clap from "../../Assets/Sounds/clap.wav";
import hat from "../../Assets/Sounds/hat.wav";
import TrackerPlayer from "./TrackerPlayer";
import {db,fire} from "../../fire";
import { useHistory } from "react-router";

function Tracker() {

    /*
    * -------------
    * HISTORY
    * -------------
    */
    const history = useHistory();


    /*
    * -------------
    * REF
    * -------------
    */

    const titleTracker = useRef();
    const descriptionTracker = useRef();

    /*
    * -------------
    * CONTEXT
    * -------------
    */

    const { dataDragDrop, setDataDragDrop } = useContext(DragDropContext);
    const { dataTracker, setDataTracker } = useContext(trackerContext);

    /*
     * -------------
     * STATES
     * -------------
     */
    const [allFile, setAllFile] = useState([])
    const [src,setSrc] = useState("");
    const [link,setLink] = useState("");
    const [isVisibility , setIsVisibility] = useState(null);
    const [dataPlayPiste, setDataPlayPiste] = useState([]);
    const storageApiLink = "jamracker-776e7.appspot.com";
    const generatePistes = (stepsNum = 12) => Array.from({ length: stepsNum }, () => 0);
    const [dataSounds, setdataSounds] = useState({

        sounds: [
            {
                name: "sound1",
                url: hat
            },
            {
                name: "sound2",
                url: clap
            },
            {
                name: "sound3",
                url: bassDrum
            },
            {
                name: "sound4",
                url: kick
            }
        ]
    })

    const [dataPistes, setdataPistes] = useState({

        stepsNum: 12,

        tracks: [
            {
                name: "1",
                duration: 0,
                steps: generatePistes()
            },
            {
                name: "2",
                duration: 0,
                steps: generatePistes()
            },
            {
                name: "3",
                duration: 0,
                steps: generatePistes()
            },
            {
                name: "4",
                duration: 0,
                steps: generatePistes()
            },
            {
                name: "5",
                duration: 0,
                steps: generatePistes()
            },
            {
                name: "6",
                duration: 0,
                steps: generatePistes()
            },
            {
                name: "7",
                duration: 0,
                steps: generatePistes()
            },
            {
                name: "8",
                duration: 0,
                steps: generatePistes()
            }
        ]
    });

    const tracks = Array.isArray(dataPistes.tracks) && dataPistes.tracks.length ? dataPistes.tracks : [];
    const steps = dataPistes.stepsNum;

    /*
    * -------------
    * DB STORAGE
    * -------------
    */

    const fecthSong = () => {

        let gsReference = fire.storage().refFromURL("gs://" + storageApiLink)

        gsReference.listAll().then(res => {
            setAllFile(res.items)
        })
    }
    const visibilityTrack = (e) => {
        
        if (e.target.value === "public") {
            setIsVisibility(true);
        } else if (e.target.value === "private") {
            setIsVisibility(false);
        }
    }

    const SaveTracker = (e) => {
        e.preventDefault();

        const titleValue = titleTracker.current.value;
        const descriptionValue = descriptionTracker.current.value;

        if (localStorage.getItem("pseudo")) {
            if(titleValue !== "" && descriptionValue !== ""){
                
                
                // envoie dans le storage .wav
                const storageRef = fire.storage().ref("Tracker")
                const element = storageRef.child(titleValue).put(src)
                
                
                const gsReference = fire.storage().refFromURL('gs://jamracker-776e7.appspot.com')
                
                // get lien dans le storage + temps de pause de 2 sec avant qu'ils partent le rechercher
                setTimeout(() => {
                    storageRef.child(titleValue).getDownloadURL().then(res => {
                        alert("Save to partern in DB !!! ")
                        db.collection("SongTracker").doc(titleValue).set({
                            title: titleValue,
                            author: JSON.parse(localStorage.getItem("pseudo")),
                            source: " Tracker ",
                            urlStorage: res,
                            description:descriptionValue,
                            visibility: isVisibility
                        })
                    })
                },2000)
                

            }else{
              alert("oops il manque un titre a votre piste !!!")
              return
            }
          }
        else {
            alert("you not have account for register");
            history.push("/login");
        }
        console.log(" src :",src)
    }
    

    useEffect(() => {
        fecthSong();
    }, [])

    /*
    * -------------
    * HANDLERS
    * -------------
    */

    //_____Fermeture de la fenetre______
    const handleClose = (ev) => {
        ev.preventDefault();
    };
    //_____fin Fermeture de la fenetre______

    //_____debut menu nav disable switch game (j'arrive pas encore à bien utiliser des foreach ou des map, alors j'ai mis ajouté/enlever une classe Disable au clic)
    // c'est pas opti mais ça fonctionne______

    /* const handleInspector = (ev) => {
        ev.preventDefault();

        document.querySelector(".box__title_inspector").classList.toggle("selected")
        document.querySelector(".box__title_browser").classList.remove("selected")
        document.querySelector(".box__title_project").classList.remove("selected")

        document.querySelector(".tracker_menu__nav__container__browser").classList.add("disable")
        document.querySelector(".tracker_menu__nav__container__project").classList.add("disable")
        document.querySelector(".tracker_menu__nav__container__inspector").classList.toggle("disable")


    }; */
    const handleBrowser = (ev) => {
        ev.preventDefault();

        document.querySelector(".tracker_menu__nav__container__browser").classList.toggle("disable")
        document.querySelector(".tracker_menu__nav__container__project").classList.add("disable")
        /* document.querySelector(".tracker_menu__nav__container__inspector").classList.add("disable") */

        /* document.querySelector(".box__title_inspector").classList.remove("selected") */
        document.querySelector(".box__title_browser").classList.toggle("selected")
        document.querySelector(".box__title_project").classList.remove("selected")

    };
    const handleProject = (ev) => {
        ev.preventDefault();
        document.querySelector(".tracker_menu__nav__container__browser").classList.add("disable")
        document.querySelector(".tracker_menu__nav__container__project").classList.toggle("disable")
        /* document.querySelector(".tracker_menu__nav__container__inspector").classList.add("disable") */

        /* document.querySelector(".box__title_inspector").classList.remove("selected") */
        document.querySelector(".box__title_browser").classList.remove("selected")
        document.querySelector(".box__title_project").classList.toggle("selected")
    };

    //_____fin du menu nav disable switch game______

    //_____________________Debut du changement de volume d'un piste______

    const handleVolume = (event) => {
        const volume = event.target.value
        setDataTracker({
            volume
        })
        //A FAIRE --> lier le chiffre du volume au volume de la sortie de la piste
    }
    //_____________________fin du changement de volume d'un piste______


    /*
    * -------------
    * EFFECTS
    * -------------
    */

    useEffect(() => {
        const newTracks = [...tracks].map(el => ({ ...el, steps: generatePistes(steps) }));
        setdataPistes({ ...dataPistes, tracks: newTracks });
    }, [steps])

    /* useEffect(() => {
        setDataPlayPiste([...dataPlayPiste, dataDragDrop])
        
    }, [dataDragDrop])
 */
//console.log("tracker",dataDragDrop)
    /*
    * -------------
    * RENDER
    * -------------
    */
    return (

        <div className="box tracker">

            <div className="box__bar">
                <div className="box__title"><h2>Tracker</h2></div>
                <button className="box__close" onClick={handleClose}>X</button>
            </div>

            <div className="box__content">
                {/* _______________________________________________________________________début de la grille */}
                <ul className="box__content__pistes">
                    {/* Première colonne à gauche de la grille pour les nombres */}


                    {/* colonne de la Première piste */}


                    {tracks.map((track, trackIdx) => (<li className="box__content__pistes__piste">

                        <h2>{track.name}</h2>
                        {track.steps.map((step, stepIdx) => (
                            <div className="track__container" data-step={stepIdx} data-track={trackIdx}>

                            <DragDrop id="move" className="grid-item step" step={stepIdx} track={trackIdx}><span>{stepIdx}</span></DragDrop>
                            </div>

                        ))
                        }
                        {/* <div className="box__volume">
                            <span>Volume : {dataTracker.volume}</span>
                            <input name="Volume" min="0" max="100" type="range" onChange={handleVolume} />
                            <button>Mute</button>
                        </div> */}
                    </li>
                    ))}


                </ul>


                {/* ______________________________________________________________________________________fin de la grille */}

                {/* ________début du gros bloc avec les menus sur la droite du tracker________ */}

                <div className="tracker_menu">
                    {/* Menu nav avec les 3 onglets */}
                    <nav className="tracker_menu_nav">
                        {/* onglet 1 inspector */}
                        {/* <div className="box__bar" >
                            <div className="box__title box__title_inspector button" onClick={handleInspector}>Inspector</div>
                        </div> */}
                        {/* onglet 2 browser */}
                        <div className="box__bar">
                            <div className="box__title box__title_browser button selected" onClick={handleBrowser}>Browser</div>
                        </div>
                        {/* onglet 3 project */}
                        <div className="box__bar">
                            <div className="box__title box__title_project button" onClick={handleProject}>Project</div>
                        </div>
                    </nav>
                    {/* Fin du menu nav */}

                    {/* Debut du container pour les 3 onglets */}
                    <div className="tracker_menu__nav__container">
                        {/* _________________________________debut de la partie INSPECTOR */}
                        <div className="tracker_menu__nav__container__inspector disable">

                            <p>Bit Properties</p>
                            {/* name */}
                            <label className="button" htmlFor="name">Name</label>
                            <input className="button input" placeholder="Drumroll" type="text" />
                            {/* select color */}
                            <label className="button" htmlFor="name">Color</label>
                            <select className="button input" placeholder="" type="text" >

                                <option className="button_pink" value="pink">Pink</option>
                                <option className="button_red" value="red">Red</option>
                                <option className="button_violet" value="violet">Violet</option>
                                <option className="button_blue" value="blue">Blue</option>
                                <option className="button_green" value="green">Green</option>
                                <option className="button_yellow" value="yellow">Yellow</option>
                                <option className="button_orange" value="orange">Orange</option>

                            </select>
                            {/* div contenant loops et son select pour les mettre en flex row */}
                            <div>
                                <label className="button" htmlFor="name">Loops</label>
                                <select className="button input" placeholder="" type="text" >

                                    <option className="button" value="loops">Audio fil</option>

                                </select></div>

                            {/* ___________Deuxieme partie - les effets */}

                            <p>Channel effects</p>

                            {/* _____________________début d'un Composant effet */}
                            <div className="tracker_menu__nav__container__inspector__fx">
                                {/* label de l'effet */}
                                <label className="button" htmlFor="name">FX-1</label>
                                {/* selection de l'effet */}
                                <select className="button" name="fx1" id="">
                                    <option className="button" value="chorus">chorus</option>
                                    <option className="button" value="compressor">compressor</option>
                                    <option className="button" value="reverb">reverb</option>
                                </select>
                                {/* Valeur de l'effet de 0 à 100 */}
                                <input name="fx1" min="0" max="100" type="range" />
                            </div>
                            {/* _____________________fin d'un Composant effet */}

                            {/* Deuxieme composant effet */}
                            <div className="tracker_menu__nav__container__inspector__fx">
                                <label className="button" htmlFor="name">FX-2</label>
                                <select className="button" name="fx2" id="">
                                    <option className="button" value="chorus">chorus</option>
                                    <option className="button" value="compressor">compressor</option>
                                    <option className="button" value="reverb">reverb</option>
                                </select>
                                <input name="fx2" min="0" max="100" type="range" />
                            </div>
                            {/* troisième composant effet */}
                            <div className="tracker_menu__nav__container__inspector__fx">
                                <label className="button" htmlFor="name">FX-3</label>
                                <select className="button" name="fx3" id="">
                                    <option className="button" value="chorus">chorus</option>
                                    <option className="button" value="compressor">compressor</option>
                                    <option className="button" value="reverb">reverb</option>
                                </select>
                                <input name="fx3" min="0" max="100" type="range" />
                            </div>

                        </div>

                        {/* _________________________________Fin de la partie INSPECTOR */}




                        {/* _________________________________debut de la partie BROWSER */}
                        <div className="tracker_menu__nav__container__browser">

                            <ul>
                                {allFile.map((item,index) => (
                                <li key={index}>
                                    <DragDrop id="move" className="grid-item">
                                        <Card id={`https://firebasestorage.googleapis.com/v0/b/${storageApiLink}/o/${item.location.path}?alt=media`} className="grid-item-active tracker__sound" draggable="true">{item.location.path}</Card>
                                    </DragDrop>
                                </li>
                                    
                                
                                ))}
                            </ul>

                            <div className="tracker_menu__nav__container__browser__buttons">
                                {/* créer un nouveau son */}
                                <button className="button">Create new</button>
                                {/* Rechercher dans la bibliothèque des sons enregistrés par la communauté */}
                                <button className="button">Hunt</button>
                            </div>
                        </div>
                        {/* _________________________________fin de la partie BROWSER */}



                        {/* _________________________________debut de la partie Project */}

                        <div className="tracker_menu__nav__container__project disable">

                            <label className="button" htmlFor="name">Name</label>
                            <input className="button input" placeholder="Your project name" type="text" ref={titleTracker}/>

                            <label className="button" htmlFor="description">Description</label>
                            <textarea className="button input" placeholder="Your project description" type="text" ref={descriptionTracker}/>

                            <label className="button" htmlFor="description">Visibility</label>
                            <select className="button input" placeholder="Your project description" type="text" value="select" onChange={ (e) => visibilityTrack(e) }>
                                <option value="select">Choisissez un role</option>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                            {isVisibility}

                            <div className="tracker_menu__nav__container__project__buttons">
                                <button className="button">Social Sharing</button>
                                <button className="button" onClick={(e) => SaveTracker(e)}>Render and Donwload</button>

                            </div>

                        </div>{/* _________________________________fin de la partie Project */}

                    </div>{/* _________________________________fin du nav container */}

                </div>{/* _________________________________fin du bloc menu à droite du tracker */}

<TrackerPlayer src={src} setSrc={setSrc} items={dataDragDrop} />
                
            </div>{/* _________________________________fin du box_content tracker */}
            
        </div>


    );
}

export default Tracker;