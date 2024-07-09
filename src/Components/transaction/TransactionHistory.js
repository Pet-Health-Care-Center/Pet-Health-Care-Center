import React, { useEffect, useState, useContext } from 'react';
import { TransactionContext } from '../context/TransactionContext';
import {fetchTransactions} from "./fetchTransaction"

const TransactionHistory = () => {
  const { setDescriptions, setAmounts } = useContext(TransactionContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchTransactions();
        setDescriptions(result.descriptions);
        setAmounts(result.amounts);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, [setDescriptions, setAmounts]);

  return null;
};

export default TransactionHistory;