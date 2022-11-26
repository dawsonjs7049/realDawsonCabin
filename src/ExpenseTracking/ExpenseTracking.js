
import React, { useState, useEffect, useRef } from "react"
import Select from 'react-select';


// import styles from "./styles.css";

const firebase = require('firebase');

export default function ExpenseTracking( { username, deleteExpenseToast}) {

    const descriptionRef = useRef();
    const priceRef = useRef();

    const ONE_MONTH = 1;
    const SIX_MONTH = 6;
    const TWELVE_MONTH = 12;
    const ALL = -1;
    const CUSTOM = -2;

    const [startingExpenses, setStartingExpenses] = useState();
    const [displayedExpenses, setDisplayedExpenses] = useState([]);
    const [runningTotal, setRunningTotal] = useState();
    const [filteredTotal, setFilteredTotal] = useState(0);
    const [type, setType] = useState('Deposit (+)');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const types = [
        {
            label: 'Deposit (+)',
            value: 'Deposit',
        },
        {
            label: 'Payment (-)',
            value: 'Payment',
        }
    ];

    const filters = [
        {
            label: '1 Month',
            value: ONE_MONTH,
        },
        {
            label: '6 Months',
            value: SIX_MONTH,
        },
        {
            label: '12 Months',
            value: TWELVE_MONTH,
        },
        {
            label: 'All Time',
            value: ALL,
        }
    ];

    useEffect(() => {
        firebase
            .firestore()
            .collection('Expenses')
            // .limit(10)
            .orderBy("timestamp")
            .onSnapshot(serverUpdate => {
                const allExpenses = serverUpdate.docs.map(_doc => {   
                    const data = _doc.data();
                    data['id'] = _doc.id;
                    return data;
                });

            setStartingExpenses(allExpenses);

            let runTotal = 0;
            for(var i = 0; i < allExpenses.length; i++)
            {
                runTotal += parseFloat(allExpenses[i].amount);
            }

            setRunningTotal(runTotal);
            
            handleSetDisplayedExpenses(SIX_MONTH, allExpenses, null, null);
        })
    }, [])  

    const handleSetDisplayedExpenses = (timeframe, startingArr, start, end) => {
        let filterArr = (startingArr !== null ? startingArr : startingExpenses);

        let newArr = [];
        const timestamp = getTimestamp(timeframe);

        switch(timeframe) {
            case ONE_MONTH:
            case SIX_MONTH:
            case TWELVE_MONTH:
                filterArr.forEach((expense) => {
                    let myTimestamp = (expense.timestamp !== null ? expense.timestamp.seconds : new Date().getTime() / 1000);
                    if(myTimestamp > timestamp)
                    {
                        newArr.push(expense);
                    }
                });
                break;

            case ALL:
                newArr = filterArr;
                break;

            default:
                filterArr.forEach((expense) => {
                    if(expense.timestamp.seconds > start && expense.timestamp.seconds < end)
                    {
                        newArr.push(expense);
                    }
                });
        };

        let filteredTotal = 0;
        newArr.forEach((expense) => {
            filteredTotal += parseFloat(expense.amount);
        })

        setFilteredTotal(filteredTotal);
        setDisplayedExpenses(newArr);
        
    }

    const handleAddExpense = () => {

        if(username == 'Kevin' || username == 'Jake906')
        {
            console.log("TYPE: " + type);
            firebase
                .firestore()
                .collection('Expenses')
                .add({
                    description: descriptionRef.current.value,
                    type: type,
                    date: new Date().toLocaleDateString("en-US"),
                    amount: (type == 'Deposit (+)' ? parseFloat(priceRef.current.value).toFixed(2) : "-" + parseFloat(priceRef.current.value).toFixed(2)),
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
    
    const handleSelectChange = (item) => {
        setType(item.label)
    }

    const handleFilterChange = (item) => {
        handleSetDisplayedExpenses(item.value, null, null, null);

        setStartDate('');
        setEndDate('');
    }

    const handleStartDate = (e) => {
        let start = e.target.value;
        let end = '';

        start = new Date(start).getTime() / 1000;
        end = (endDate === '' ? new Date().getTime() : new Date(endDate).getTime()) / 1000;

        setStartDate(e.target.value);

        handleSetDisplayedExpenses(CUSTOM, null, start, end);

    }

    const handleEndDate = (e) => {
        let end = e.target.value;
        let start = '';

        end = new Date(end).getTime() / 1000;
        start = (startDate === '' ? new Date('1970-01-01').getTime() : new Date(startDate).getTime()) / 1000;

        setEndDate(e.target.value);

        handleSetDisplayedExpenses(CUSTOM, null, start, end);
    }

    const getTimestamp = (months) => {
        const date = new Date();
        date.setMonth(date.getMonth() - months);

        return (date.getTime() / 1000);
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
                    <Select
                        defaultValue={{ label: "Deposit (+)", value: "Deposit" }}
                        onChange={(item) => handleSelectChange(item)}
                        options={types}
                        menuPlacement="bottom"
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
                <div style={{ width: '100%', height: '2px', backgroundColor: 'white', maxHeight: '300px', overflowY: 'auto' }}></div>
                <div style={{ maxHeight: '800px', overflowY: 'auto'}}>
                {
                    displayedExpenses.length > 0 &&

                    displayedExpenses.map(expense => {
                        return (
                            <div key={expense.id} className="expense-items-container">
                                <div className="expense-item">{expense.description}</div>
                                <div className="expense-item">{expense.date}</div>
                                <div className="expense-item" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>{(expense.amount < 0 ? '-' : '')}${Math.abs(expense.amount)}</div>
                                    <div><button className="expense-delete-btn" onClick={() => handleDeleteExpense(expense.id)}><i className="far fa-trash-alt"></i></button></div>
                                </div>
                            </div>
                        )
                    })
                }

                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <div className="expense-totals-container">
                    <div className="running-total-container" style={{marginRight: '1 rem'}}>
                        Running Total: {(runningTotal < 0 ? '-' : '')}${Math.abs(parseFloat(runningTotal).toFixed(2))}
                    </div>
                    <div className="running-total-container">
                        Filtered Total: {(filteredTotal < 0 ? '-' : '')}${Math.abs(parseFloat(filteredTotal).toFixed(2))}
                    </div>
                </div>
            
                <div className="expense-filter-container">
                    <div className="expense-filter-select">
                        <p style={{ marginTop: 0, marginBottom: '5px', color: 'white'}}>Filter</p>
                        <Select
                            defaultValue={{ label: "6 Months", value: SIX_MONTH }}
                            onChange={(item) => handleFilterChange(item)}
                            options={filters}
                            menuPlacement="top"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column'}}>
                        <p style={{ marginTop: 0, marginBottom: '5px', color: 'white'}}>Custom Start</p>
                        <input type="date" value={startDate} onChange={(e) => handleStartDate(e)} className="filter-item"/>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column'}}>
                        <p style={{ marginTop: 0, marginBottom: '5px', color: 'white'}}>Custom End</p>
                        <input type="date" value={endDate} onChange={(e) => handleEndDate(e)} className="filter-item"/>
                    </div>
                </div>
            </div>
        </div>
    )
}
