import React, { useState, useEffect } from "react"

import styles from "./styles.css"

const firebase = require('firebase');

const CommentBubble = (props) => {
    const { comment, author, date, id, currentComment, username } = props;

    const [editedComment, setEditedComment] = useState("")
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        
        setEditedComment(comment)
        console.log("in effect")
    }, [])    

    const deleteComment = () => {
    
        if(username === author) {
            firebase
            .firestore()
            .collection('Comments')
            .doc(id)
            .delete();
        }
    }

    const editComment = () => {
        if(username === author) {
            setShowEditModal(true)
        }
    }

    const handleEdit = (e) => {
       setEditedComment(e.target.value)
    }

    const saveComment = async () => {
        let newDate = firebase.firestore.Timestamp.fromDate(new Date())
        setShowEditModal(false)

        firebase
            .firestore()
            .collection('Comments')
            .doc(id) 
            .update({
                author: author,
                comment: editedComment,
                date: newDate,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
    }

    return (
        <div className="bubble-container">
            {showEditModal ? (
                <>
                    <div className="bubble-comment-div">
                        <div className="bubble-comment">
                            <textarea className="edit-area" onChange={(e) => handleEdit(e)} required value={editedComment}></textarea>
                        </div>
                        <div className="bubble-bottom">
                            Posted by {author} on {date}
                        </div>
                    </div>
                    <div className="comment-delete-div">
                        <button className="comment-edit-button" onClick={() => saveComment()}><i class="far fa-save fa-lg"></i></button>
                    </div>
                 </>
            ) : (
                <>
                    <div className="bubble-comment-div">
                        <div className="bubble-comment">
                            {comment}
                        </div>
                        <div className="bubble-bottom">
                            Posted by {author} on {date}
                        </div>
                    </div>
                    <div className="comment-delete-div">
                        <button className="comment-edit-button" onClick={() => editComment()}><i class="far fa-edit fa-lg"></i></button>
                        <button className="comment-delete-button" onClick={() => deleteComment()}><i class="far fa-trash-alt fa-lg"></i></button>
                    </div>
                </>
            )}
        </div>
    )
}

export default CommentBubble