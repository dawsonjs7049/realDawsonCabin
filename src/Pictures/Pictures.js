import React, { useState, useEffect } from 'react'
import styles from "./styles.css"

const firebase = require('firebase');


const Pictures = (props) => {

    const [uploadImage, setUploadImage] = useState(null)
    const [progressValue, setProgressValue] = useState(0)
    const [showUploadButtons, setShowUploadButtons] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)
    const [imageComment, setImageComment] = useState('')
    const [selectedImage, setSelectedImage] = useState({})
    const [showEditModal, setShowEditModal] = useState(false)
    const [updatedComment, setUpdatedComment] = useState("")
    const [chunkedImages, setChunkedImages] = useState([])
    const [chunkIndex, setChunkIndex] = useState(0)

    const chunkSize = 3

    let storageRef = firebase.storage().ref()
    let { imageData, username } = props

    console.log("IMAGE DATA: " + imageData)

    useEffect(() => {
        
        let array = imageData
    
        let totalArray = [];
        let index = 0;
        
        while(index < array.length) {
            totalArray.push(array.slice(index, chunkSize + index));
            index += chunkSize
        }

        setChunkedImages(totalArray)

    },[imageData])
    
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

                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                    firebase
                        .firestore()
                        .collection('images')
                        .add({
                            comment: imageComment,
                            owner: username,
                            date: firebase.firestore.FieldValue.serverTimestamp(),
                            imageURL: downloadURL,
                            filename: `cabinPictures/${uploadImage.name}`,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        })
                })
            });
        }
    }


    const handleFileSelect = (e) => {

        if (e.target.files[0]) {
            setShowUploadButtons(true)
            setUploadImage(e.target.files[0])
        }
    }

    const handleDelete = () => {

        setShowImageModal(false)
       
        let myRef = storageRef.child(selectedImage.filename)

        myRef.delete().then(() => console.log("Deleted picture from storage!")).catch((error) => console.log(error))

        firebase
            .firestore()
            .collection('images')
            .doc(selectedImage.id)
            .delete();
    }

    const handleEdit = () => {

        setShowEditModal(false)
        
        firebase
            .firestore()
            .collection('images')
            .doc(selectedImage.id) 
            .update({
                comment: updatedComment,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
    }

    return (
        <div className="pictures-container">
            {showImageModal &&
                <div className="imageModalContainer">
                    <img className="modalImage" src={selectedImage.imageURL}></img>
                    <div className={username === selectedImage.owner ? "comment-div" : "comment-div-small"}>
                        <div className="comment-p">
                            {showEditModal ? 
                                (
                                    <div className="edit-div">
                                        <textarea className="edit-area" value={updatedComment} onChange={(e) => setUpdatedComment(e.target.value)}></textarea>
                                        <button className="edit-save-btn" onClick={() => handleEdit()}><i className="far fa-save fa-lg"></i></button>
                                    </div>
                                ) :
                                (
                                    <textarea className="edit-area-2" value={updatedComment} readOnly={true}></textarea>
                                )
                            }
                        </div>
                        <div style={{textAlign: "right", marginRight: ".5rem", fontSize: "14px"}}>Posted by {selectedImage.owner} on {selectedImage.date}</div>
                        {selectedImage.owner === username &&
                            <div className="image-buttons-div">
                                <button className="comment-edit-btn" onClick={() => setShowEditModal(true)}>Edit Comment<i className="icon far fa-edit fa-lg"></i></button>
                                <button className="image-delete-btn" onClick={() => handleDelete()}>Delete Image<i className="icon far fa-trash-alt fa-lg"></i></button>
                            </div>
                        }
                    </div>
                    <button type="button" className="modalCloseButton" onClick={() => {
                        setShowImageModal(false)
                        setUpdatedComment("")
                        setShowEditModal(false)
                    }}>Close<i className="icon fas fa-times"></i></button>
                </div>
            }

            <h2>Upload a Picture!</h2>

            <div className="buttons-container">
                <input type="file" name="file" id="file" className="inputfile" onChange={(e) => handleFileSelect(e)}/>
                <label for="file" className="input-label">Select Photo <i className="fas fa-image icon"></i></label>
                {showUploadButtons &&
                    <button className="upload-button" onClick={() => handleUpload()}>Upload "{uploadImage.name}" <i className="fas fa-file-upload icon"></i></button>
                }
            </div>
            {showUploadButtons &&
                <div>
                    <input className="picture-comment-input" type="text" placeholder="Enter a comment..." onChange={(e) => setImageComment(e.target.value)} />
                </div>
            }
            
            <div className="progress-div">
                {progressValue > 0 && progressValue < 100 &&
                    <progress value={progressValue} max="100"></progress>
                }
            </div>
        
            <div className="pictures">
                
                {chunkedImages.length > 0 && 
                    
                    chunkedImages[chunkIndex].map((image, index) => {
                        return <img className="picture" key={index} src={image.imageURL} onClick={() => {
                            setShowImageModal(true)
                            setSelectedImage(image)
                            setUpdatedComment(image.comment)
                        }}></img>
                    })
                }
            </div>
            {chunkedImages.length > 1 &&
                <div className="arrow-btns-div">
                    <button className="arrow arrow-left" onClick={() => {chunkIndex > 0 ? setChunkIndex(chunkIndex - 1) : setChunkIndex(chunkedImages.length - 1)}}><i className="fas fa-arrow-left fa-2x"></i></button>
                    <button className="arrow" onClick={() => {chunkIndex < chunkedImages.length - 1 ? setChunkIndex(chunkIndex + 1) : setChunkIndex(0)}}><i className="fas fa-arrow-right fa-2x"></i></button>
                </div>
            }
        </div>
    )
}

export default Pictures