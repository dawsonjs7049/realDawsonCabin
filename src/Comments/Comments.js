import React, { useState, useEffect } from "react"
import styles from "./styles.css";
import CommentBubble from "../CommentBubble/CommentBubble"

const firebase = require('firebase');

const Comments = (props) => {

    const [comment, setComment] = useState(null)
    const [currentComment, setCurrentComment] = useState('')

    useEffect(() => {
        firebase
            .firestore()
            .collection('Comments')
            .limit(10)
            .orderBy("date")
            .onSnapshot(serverUpdate => {
                const comments = serverUpdate.docs.map(_doc => {   
                    const data = _doc.data();
                    data['id'] = _doc.id;
                    return data;
                });

            let fetchedComments = comments.map(comment => {
                    let date;

                    //workaround for it throwing errors when editing comments (giving null date but it still updates correctly?)
                    if(!comment.date) {
                        date = new Date()
                    } else {
                        date = comment.date.toDate()
                    }

                    let dateString = date.getUTCFullYear() + "-" + ("0" + (date.getUTCMonth()+1)).slice(-2) + "-" + ("0" + date.getUTCDate()).slice(-2)
                    return {comment: comment.comment, date: dateString, author: comment.author, id: comment.id}
                })

            //reverse makes it so the most recent comments are listed first
            setComment(fetchedComments.reverse())
            console.log(fetchedComments)
        })
    }, [])  

    const handleComment = (e) => {
        setCurrentComment(e.target.value)
        console.log(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setCurrentComment("")
        
        if(currentComment.length > 0) {

            const newCommentFromDB = await firebase
                .firestore()
                .collection('Comments')
                .add({
                    author: props.username,
                    comment: currentComment,
                    date: firebase.firestore.FieldValue.serverTimestamp(),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
        }
    }


    return (
        <div className="comments-container">
            <h2 className="comment-h2"> Add a Comment!</h2>
            <h3 className="comment-h3"> Note - you can only edit/delete your own comments</h3>
            <div className="comments-header">
                <input className="comment-input" value={currentComment} type="text" onChange={(e) => handleComment(e)} />
                <button className="comment-submit-button" type="submit" onClick={(e) => handleSubmit(e)}> Submit </button>
            </div>
            <div className="comments-body">
                {comment &&
                    comment.map(comment => {
                        return <CommentBubble key={comment.id} currentComment={currentComment} username={props.username} comment={comment.comment} author={comment.author} date={comment.date} id={comment.id}></CommentBubble>
                    })
                }
            </div>
        </div>
    )
}

export default Comments