import React, { useState, useEffect, useRef } from "react"
import { Dropdown } from 'reactjs-dropdown-component';

// import styles from "./styles.css";

const firebase = require('firebase');

export default function ExpenseTracking( { username, deleteExpenseToast}) {

    const descriptionRef = useRef();
    const priceRef = useRef();

    const [allExpenses, setAllExpenses] = useState();
    const [runningTotal, setRunningTotal] = useState();
    const [type, setType] = useState('Expense');

    const types = [
        {
            label: 'Expense',
            value: 'Expense',
        },
        {
            label: 'Payment',
            value: 'Payment',
        }
    ];

    const handleSelectChange = (item, name) => {
        console.log("ITEM: " + JSON.stringify(item) + " - NAME: " + name);
        setType(item.label);
    }

    useEffect(() => {
        firebase
            .firestore()
            .collection('Expenses')
            // .limit(10)
            .orderBy("timestamp")
            .onSnapshot(serverUpdate => {
                const expenses = serverUpdate.docs.map(_doc => {   
                    const data = _doc.data();
                    data['id'] = _doc.id;
                    return data;
                });

            //reverse makes it so the most recent comments are listed first
            setAllExpenses(expenses)

            let runTotal = 0;
            for(var i = 0; i < expenses.length; i++)
            {
                runTotal += parseFloat(expenses[i].amount);
            }

            setRunningTotal(runTotal);

        })
    }, [])  

    const handleAddExpense = () => {

        if(username == 'Kevin' || username == 'Jake906')
        {
            firebase
                .firestore()
                .collection('Expenses')
                .add({
                    description: descriptionRef.current.value,
                    type: type,
                    date: new Date().toLocaleDateString("en-US"),
                    amount: (type == 'Expense' ? parseFloat(priceRef.current.value).toFixed(2) : "-" + parseFloat(priceRef.current.value).toFixed(2)),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })

            descriptionRef.current.value = '';
            priceRef.current.value = '';
        }
    }

    const handleDeleteExpense = (expenseId) => {
        
        if(username == 'Kevin' || username == 'Jake906')
        {
            firebase
                .firestore()
                .collection('Expenses')
                .doc(expenseId)
                .delete();

            deleteExpenseToast();
        }
    }


    return (
        <div className="expense-container">
            <h2 className="text-light">Expense Tracking</h2>
            <div className="expense-inputs-container">
                <div className="expense-inputs-div-containers">
                    <div className=""><strong>Description</strong></div>
                    <input type="text" ref={descriptionRef} className="expense-input-description"></input>
                </div>
                
                <div className="expense-inputs-div-containers">
                    <div className=""><strong>Type</strong></div>
                    <Dropdown
                        select={{value: 'Expense'}}
                        name="expenseType"
                        title="Select"
                        list={types}
                        onChange={(item, name) => handleSelectChange(item, name)}
                    />
                </div>
                
                <div className="expense-inputs-div-containers">
                    <div className=""><strong>Amount</strong></div>
                    <input type="number" className="expense-input-price" ref={priceRef}></input>
                </div>
                
                <button type="button" className="expense-add-btn" onClick={() => handleAddExpense()}><i className="fas fa-plus"></i></button>
            </div>
            <div className="expenses">
                <div className="expense-header">
                    <div className="expense-header-item text-light">
                         <strong>Description</strong> 
                    </div>
                    <div className="expense-header-item text-light">
                         <strong>Date</strong> 
                    </div>
                    <div className="expense-header-item text-light">
                         <strong>Amount</strong> 
                    </div>
                </div>
                <div style={{ width: '100%', height: '2px', backgroundColor: 'white' }}></div>
                {
                    allExpenses &&

                    allExpenses.map(expense => {
                        return (
                            <div key={expense.id} className="expense-items-container">
                                <div className="expense-item">{expense.description}</div>
                                <div className="expense-item">{expense.date}</div>
                                <div className="expense-item" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>${expense.amount}</div>
                                    <div><button className="expense-delete-btn" onClick={() => handleDeleteExpense(expense.id)}><i className="far fa-trash-alt"></i></button></div>
                                </div>
                            </div>
                        )
            
                    })
                }

            </div>
            <div className="running-total-container">
                <div className="running-total">
                    Running Total: ${parseFloat(runningTotal).toFixed(2)}
                </div>
            </div>
        </div>
    )
}
