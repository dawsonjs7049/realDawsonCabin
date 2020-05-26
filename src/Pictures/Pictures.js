import React, { useState, useEffect } from 'react'
import styles from "./styles.css"

const firebase = require('firebase');


const Pictures = (props) => {

    const [uploadImage, setUploadImage] = useState(null)
    const [progressValue, setProgressValue] = useState(0)
    const [showUploadButtons, setShowUploadButtons] = useState(false)

    let storageRef = firebase.storage().ref()
    let { pictureURLs, reloadImages } = props

    
    const handleUpload = () => {
        if(uploadImage){
            setProgressValue(0)

            const uploadTask = storageRef.child(`cabinPictures/${uploadImage.name}`).put(uploadImage)
            uploadTask.on('state_changed', 
            (snapshot) => {
                //progress function
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes ) * 100)
                setProgressValue(progress)
            }, 
            (error) => {
                //error function
                console.log(error)
            },
            () => {
                //complete function
                setShowUploadButtons(false)
                reloadImages()
            });
        }
    }

    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setShowUploadButtons(true)
            setUploadImage(e.target.files[0])
        }
    }

    return (
        <div className="pictures-container">
            <h2>Upload a Picture!</h2>

            <div className="buttons-container">
                <input type="file" name="file" id="file" className="inputfile" onChange={(e) => handleFileSelect(e)}/>
                <label for="file" className="input-label">Select Photo <i className="fas fa-image icon"></i></label>
                {showUploadButtons &&
                    <button className="upload-button" onClick={() => handleUpload()}>Upload "{uploadImage.name}" <i className="fas fa-file-upload icon"></i></button>
                }
            </div>
            
            <div className="progress-div">
                {progressValue > 0 && progressValue < 100 &&
                    <progress value={progressValue} max="100"></progress>
                }
            </div>
        
            <div className="pictures">
                {
                    pictureURLs.map((url, index) => {
                        return <img className="picture" key={index} src={url}></img>
                    })
                }
            </div>
        </div>
    )
}

export default Pictures