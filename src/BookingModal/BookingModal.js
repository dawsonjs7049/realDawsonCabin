import React from 'react'

const BookingModal = (props) => {

return (
    <div className="modal">
        <div className="modal-header-div">
            {/* <h3 className="modal-top-header">Selected Date: {props.simpleDate}</h3>
            <h3>Expected Total People?</h3> */}
            {console.log("SIMPLE DATE: " + props.simpleDate)}
            <h3 className="modal-top-header">Selected Date(s)</h3>
            <h3 style={{ textAlign: "center", margin: '0'}}>{props.simpleDate}</h3>
            
        </div>

        <h3>Expected Total People?</h3>
        <input 
            required
            className="modal-input" 
            type="text"
            onChange={(event) => {
                props.setExpectedPeople(event.target.value)
            }}>
        </input>
        
        <div className="modal-btn-div">
            <button 
                className="modal-button"
                onClick={() => {
                    if(props.expectedPeople !== null && !props.checkPeopleInput(props.expectedPeople)) {
                        props.handleSubmit()
                        props.setShowModal(false)
                    }
                }}
                >Book'em Danno
            </button>
            <button 
                className="modal-cancel"
                onClick={() => {
                    props.setShowModal(false)
                }}
                >Cancel
            </button>
        </div>
    </div>
)

}

export default BookingModal