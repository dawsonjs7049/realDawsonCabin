import React from 'react'

const HelpModal = (props) => {

return (
    <div className="help-modal-container">
        <div className="help-modal">
            <div className="help-modal-body">
            
                <h4 className="help-h4">Weather</h4>
                <p>You can access more detailed weather forcasts by clicking anywhere on the weather banner</p>

                <h4 className="help-h4">Calendar</h4>
                <p>
                    To select a date to reserve, click any open square and then enter the expected number of people that 
                    will be there on that day, then select the top green button to book it or the bottom red button to exit                            
                </p>
                <p>
                    To update a date you've already reserved, click on that date square and either re-enter the number of
                    expected people and press the green "update" button, or select the "yes" button at the bottom of the 
                    pop-up to delete your reservation. Cancel will close the modal. Please note that you can only update/delete
                    your own reservations
                </p>

                <h4 className="help-h4">Comments</h4>
                <p>
                    Use the comments section to update others on cabin issues, projects, or anything else
                    that you all might find useful. Post a comment by clicking on the white rectangle input box next to the 
                    submit button and typing your comment, then press submit when you're ready to post it. 
                </p>
                <p>
                    If you would like to edit 
                    a post you've previously made, you can select the green edit button on the right of the post and then select the 
                    text on the comment to edit its content. When you're finished, press the green save button on the right to save your
                    changes. You can also delete your comment entirely by pressing the red trash button. Please note that you may only 
                    edit/delete your own comments and that only the 10 most recent comments are currently displayed on the website
                </p>

                <h4 className="help-h4">Pictures</h4>
                <p>
                    To upload a photo, press the "select photo" button and navigate to the photo you would 
                    like to select and press "open" (on a Windows computer). Then press the "upload" button
                    that appears to actually send the file. The name of the selected file is shown in the 
                    "upload" button, if you selected the wrong photo, simply press the "select photo" button
                    again and select the correct photo and then press the "upload" button. A progess bar will 
                    appear above the photos to let you know the completion status of your upload.
                </p>

                <h4 className="help-h4">Notice a Problem?</h4>
                <p>
                    Email me at jake906@charter.net and I will maybe possibly try to fix it
                </p>
            </div>

            

            <button className="modal-cancel help-modal-close" onClick={() => props.showHelpModal(false)}>Close</button>
        </div>
    </div>
)

}

export default HelpModal