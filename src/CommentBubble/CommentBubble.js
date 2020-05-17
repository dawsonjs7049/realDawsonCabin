import React from "react"

import styles from "./styles.css"

const firebase = require('firebase');

const CommentBubble = (props) => {
    const { comment, author, date, id, currentComment, username } = props;

    const deleteComment = () => {
    
        if(username === author) {
            firebase
            .firestore()
            .collection('Comments')
            .doc(id)
            .delete();
        }
    }

    return (
        <div className="bubble-container">
            <div className="bubble-comment-div">
                <div className="bubble-comment">
                    {comment}
                </div>
                <div className="bubble-bottom">
                    Posted by {author} on {date}
                </div>
            </div>
            <div className="comment-delete-div">
                <button className="comment-delete-button" onClick={() => deleteComment()}><i class="far fa-trash-alt fa-2x"></i></button>
            </div>
            
        </div>
    )
}

export default CommentBubble