const fetch = require('node-fetch');
const { getDatabase, ref, get, update, set, onValue, runTransaction } = require('firebase/database');

exports.getTransactions = async (req, res) => {
  try {
    const response = await fetch(process.env.REACT_APP_CASSO_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Apikey ${process.env.REACT_APP_CASSO_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const descriptions = result.data.records.map(record => record.description);
    const times = result.data.records.map(record => record.when);
    const amounts = result.data.records.map(record => record.amount);

    res.status(200).json({ descriptions, times, amounts });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};

exports.updateUserBooking = async (req, res) => {
  const { uid, bookingId, paymentAmountInSystem, totalPaid, selectedDateTime, selectedPet, selectedServices, username, userId } = req.body;
  const db = getDatabase();
  const userRef = ref(db, `users/${uid}`);

  try {
    const snapshot = await get(userRef);
    const data = snapshot.val();

    if (!data) {
      throw new Error('No user data found.');
    }

    const accountBalanceNumber = parseFloat(data.accountBalance);
    const newAccountBalance = accountBalanceNumber + paymentAmountInSystem - totalPaid;

    if (newAccountBalance >= 0) {
      await runTransaction(userRef, (currentUser) => {
        if (currentUser) {
          currentUser.accountBalance = newAccountBalance;
        }
        return currentUser;
      });

      const bookingRef = ref(db, `users/${uid}/bookings`);
      const bookingSnapshot = await get(bookingRef);
      const bookings = bookingSnapshot.val();
      if (bookings) {
        const bookingKey = Object.keys(bookings).find(
          (key) => bookings[key].bookingId === bookingId
        );
        if (bookingKey) {
          const specificBookingRef = ref(
            db,
            `users/${uid}/bookings/${bookingKey}`
          );
          await runTransaction(specificBookingRef, (currentBooking) => {
            if (currentBooking) {
              currentBooking.status = "Paid";
            }
            return currentBooking;
          });
        }
      }

      const bookingSlotRef = ref(
        db,
        `users/${selectedDateTime.vet.uid}/schedule/${selectedDateTime.date}`
      );
      const bookingSlotSnapshot = await get(bookingSlotRef);
      let bookedSlots = Array.isArray(bookingSlotSnapshot.val())
        ? bookingSlotSnapshot.val()
        : [];

      bookedSlots.push({
        time: selectedDateTime.time,
        petName: selectedPet.name,
        services: selectedServices.map((service) => service.name),
        userAccount: data.email,
        username: username,
        status: 1,
        bookingId: bookingId,
        userId: userId
      });

      await set(
        ref(
          db,
          `users/${selectedDateTime.vet.uid}/schedule/${selectedDateTime.date}`
        ),
        bookedSlots
      );

      res.status(200).json({ message: 'Booking and user balance updated successfully' });
    } else {
      throw new Error('Insufficient balance');
    }
  } catch (error) {
    console.error('Error updating user booking: ', error);
    res.status(500).json({ error: 'Failed to update user booking' });
  }
};

// controllers/mbbankController.js

const axios = require('axios');
const moment = require('moment-timezone');

const taikhoanmb = "DUYBAO0312";
const deviceIdCommon = "f1wegonh-mbib-0000-0000-2024052023591852";
const sessionId = "520a60f2-23c3-445b-9397-266497717a8e";
const sotaikhoanmb = "0000418530364";

exports.getTransactionHistory = async (req, res) => {
  try {
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .join("/");

    const toDate = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .join("/");

    const time2 = moment().tz("Asia/Ho_Chi_Minh").format("YYYYMMDDHHmmssSS");

    const url = 'https://online.mbbank.com.vn/api/retail-transactionms/transactionms/get-account-transaction-history';
    const data = {
      accountNo: sotaikhoanmb,
      deviceIdCommon: deviceIdCommon,
      fromDate: fromDate,
      refNo: `${taikhoanmb}-${time2}`,
      sessionId: sessionId,
      toDate: toDate,
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': 'Basic QURNSU46QURNSU4=',
        'Connection': 'keep-alive',
        'Host': 'online.mbbank.com.vn',
        'Origin': 'https://online.mbbank.com.vn',
        'Referer': 'https://online.mbbank.com.vn/information-account/source-account',
        'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
        'DNT': '1',
        'Deviceid': deviceIdCommon,
        'RefNo': `${taikhoanmb}-${time2}`,
        'X-Request-Id': `${taikhoanmb}-${time2}`,
        'elastic-apm-traceparent': '00-88166d8e47d20c4f80ec12bcf81505f5-6b706d62d8ca3ab8-01'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};
