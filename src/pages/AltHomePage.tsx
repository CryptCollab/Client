import * as React from "react";
import Navbar from "../components/Navigationbar";
import styles from "../styles/AltHomePage.module.css"
import { relative } from "path";
import MovingText from 'react-moving-text'
import MovingComponent from 'react-moving-text'

function AltHome() {  

	console.log(styles)
    const enclosingDivStyle:React.CSSProperties = {       
        margin:0,
        color:"white",
        background:"#202731",
        overflowX:"hidden",
        whiteSpace:"nowrap",
        height:"100vh",
    }

    const divStyle:React.CSSProperties = {
        position:"relative",
        display:"flex",
        flexDirection:"column",
        justifyContent:"space-between",
        alignItems:"center",        
        minHeight:"380px",
        paddingTop:"80px",
    };

	return (   
		<>            
			<Navbar/>
            <div style={enclosingDivStyle}>
                <div style={divStyle} className={styles.red}>
                    <h1>CryptCollab</h1> 
                        <h5 style={{padding:"1rem"}}>
                            <MovingComponent type="typewriter"
                                dataText={[
                                    'End to End Encrypted',
                                    'Real-time Collaboration',
                                    'Conflict-Resolution among peers'                                    
                                ]}
                            />
                        </h5>           
                    <div className={styles.wave}>
                        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                            <path
                                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                                className={styles.shapefill}>                                
                            </path>
                        </svg>        
                    </div>
                </div>
                <div className={[styles.spacer,styles.layer1].join(' ')}></div>   
            </div> 
		</>        
	);
}

export default AltHome;
