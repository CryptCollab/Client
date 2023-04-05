import * as React from "react";
import Navbar from "../components/Navigationbar";
import styles from "../styles/AltHomePage.module.css"
import { relative } from "path";


function AltHome() {  

	console.log(styles)
    const divStyle:React.CSSProperties = {margin:0,color:"white",background:"#202731",overflow:"scroll",whiteSpace:"nowrap",height:"100vh"}
    const sectionStyle:React.CSSProperties = {
        position:"relative",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        minHeight:"380px",
        paddingTop:"100px"
    };

	return (   
		<>            
			<Navbar/>
            <div style={divStyle}>
                <section style={sectionStyle} className={styles.red}>
                    <h1>CryptCollab</h1>
                    <p>A website is like a road. The more curves it has the more interesting it is.</p>
                <div className={styles.wave}>
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className={styles.shapefill}></path>
        </svg>
                </div>
                </section>
                <div className={[styles.spacer,styles.layer1].join(' ')}></div>   
            </div> 
		</>        
	);
}

export default AltHome;
