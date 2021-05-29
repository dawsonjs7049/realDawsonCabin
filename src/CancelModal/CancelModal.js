import React from 'react'

const CancelModal = (props) => {

return (
    <div className="modal-update">
        <div className="modal-header-div">
            <h3 className="modal-top-header">Selected Date(s)</h3>
            <h3 style={{ textAlign: "center", margin: '0'}}>{props.simpleDate}</h3>
        </div>
        <div className="modal-update-body">
            <h3>Update People Count</h3>
            <input 
                value={props.expectedPeople}
                className="modal-input" 
                type="text"
                onChange={(event) => {
                    props.setExpectedPeople(event.target.value)
                }}
                >
            </input>
            <button 
                className="modal-button" 
                onClick={() => {
                    if(props.expectedPeople !== null && !props.checkPeopleInput(props.expectedPeople)) {
                        props.updatePeople()
                        props.setShowCancelModal(false)
                    }
                }}>Update
            </button>
        </div>
        <div>
            <h3>OR</h3>
        </div>
        <div className="modal-update-body">
            <h3>Delete Booking(s)?</h3>
            <button 
                className="modal-button"
                onClick={() => {
                    props.cancelBooking()
                    props.setShowCancelModal(false)
                }}
                >Yes
            </button>
            <button 
                className="modal-cancel"
                onClick={() => {
                    console.log("clicked no")
                    props.setShowCancelModal(false)
                }}
                >Cancel
            </button>
        </div>
    </div>
)

}

export default CancelModal