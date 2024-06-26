import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get, update, onValue } from 'firebase/database';
import { toast } from 'react-toastify';
import { auth } from "../../Components/firebase/firebase";


const RefundModal = ({ showModal, setShowModal, userId }) => {
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [username, setUsername] = useState('');
  const [accountBalance, setAccountBalance] = useState(0);

  useEffect(() => {
    if (!userId) {
      console.log("Không có người dùng đang đăng nhập.");
      return;
    }
  
    const fetchUserData = async () => {
      try {
        const db = getDatabase();
        const userRef = ref(db, `users/${userId}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setAccountBalance(userData.accountBalance || 0);
            setUsername(userData.username);
          } else {
            console.log("Không có dữ liệu người dùng.");
          }
        });
      } catch (err) {
        console.error("Lỗi khi truy vấn dữ liệu người dùng:", err);
      }
    };
  
    fetchUserData();
  }, [userId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bank || !accountNumber || !amount) {
      toast.error("Please fill in all fields" , {
        autoClose: 2000,
      });
      return;
    }

    if (parseFloat(amount) > accountBalance) {
      toast.error("Amount exceeds account balance", {
        autoClose: 2000,
      });
      return;
    }

    const db = getDatabase();
    const refundRef = ref(db, `users/${userId}/refundMoney`);
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });

    const newRefundRequest = {
      bank,
      accountNumber,
      amount,
      date: timestamp,
      isRefund: false,
      username: username,
      userId: userId
    };

    try {
      const snapshot = await get(refundRef);
      let refunds = [];

      if (snapshot.exists()) {
        refunds = snapshot.val();
      }

      refunds.push(newRefundRequest);

      await set(refundRef, refunds);

      const newBalance = accountBalance - parseFloat(amount);
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, { accountBalance: newBalance });

      setBank("");
      setAccountNumber("");
      setAmount("");

      toast.success("Refund request added successfully!", {
        autoClose: 2000,
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error adding refund information: ", error);
      toast.error("Failed to add refund information. Please try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleMaxClick = () => {
    setAmount(accountBalance.toString());
  };

  return (
    showModal && (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header refund-header">
            <h3>Request Refund</h3>
            <span className="modal-close" onClick={closeModal}>&times;</span>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Bank:</label>
                <select
                  name="bank"
                  className="input"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                >
                  <option value="">-- Select bank --</option>
                  <option value="ICB">(970415) VietinBank</option>
                  <option value="VCB">(970436) Vietcombank</option>
                  <option value="BIDV">(970418) BIDV</option>
                  <option value="VBA">(970405) Agribank</option>
                  <option value="OCB">(970448) OCB</option>
                  <option value="MB">(970422) MBBank</option>
                  <option value="TCB">(970407) Techcombank</option>
                  <option value="ACB">(970416) ACB</option>
                  <option value="VPB">(970432) VPBank</option>
                  <option value="TPB">(970423) TPBank</option>
                  <option value="STB">(970403) Sacombank</option>
                  <option value="HDB">(970437) HDBank</option>
                  <option value="VCCB">(970454) VietCapitalBank</option>
                  <option value="SCB">(970429) SCB</option>
                  <option value="VIB">(970441) VIB</option>
                  <option value="SHB">(970443) SHB</option>
                  <option value="EIB">(970431) Eximbank</option>
                  <option value="MSB">(970426) MSB</option>
                  <option value="CAKE">(546034) CAKE</option>
                  <option value="Ubank">(546035) Ubank</option>
                  <option value="TIMO">(963388) Timo</option>
                  <option value="VTLMONEY">(971005) ViettelMoney</option>
                  <option value="VNPTMONEY">(971011) VNPTMoney</option>
                  <option value="SGICB">(970400) SaigonBank</option>
                  <option value="BAB">(970409) BacABank</option>
                  <option value="PVCB">(970412) PVcomBank</option>
                  <option value="Oceanbank">(970414) Oceanbank</option>
                  <option value="NCB">(970419) NCB</option>
                  <option value="SHBVN">(970424) ShinhanBank</option>
                  <option value="ABB">(970425) ABBANK</option>
                  <option value="VAB">(970427) VietABank</option>
                  <option value="NAB">(970428) NamABank</option>
                  <option value="PGB">(970430) PGBank</option>
                  <option value="VIETBANK">(970433) VietBank</option>
                  <option value="BVB">(970438) BaoVietBank</option>
                  <option value="SEAB">(970440) SeABank</option>
                  <option value="COOPBANK">(970446) COOPBANK</option>
                  <option value="LPB">(970449) LienVietPostBank</option>
                  <option value="KLB">(970452) KienLongBank</option>
                  <option value="KBank">(668888) KBank</option>
                  <option value="KBHN">(970462) KookminHN</option>
                  <option value="KEBHANAHCM">(970466) KEBHanaHCM</option>
                  <option value="KEBHANAHN">(970467) KEBHANAHN</option>
                  <option value="MAFC">(977777) MAFC</option>
                  <option value="CITIBANK">(533948) Citibank</option>
                  <option value="KBHCM">(970463) KookminHCM</option>
                  <option value="VBSP">(999888) VBSP</option>
                  <option value="WVN">(970457) Woori</option>
                  <option value="VRB">(970421) VRB</option>
                  <option value="UOB">(970458) UnitedOverseas</option>
                  <option value="SCVN">(970410) StandardChartered</option>
                  <option value="PBVN">(970439) PublicBank</option>
                  <option value="NHB HN">(801011) Nonghyup</option>
                  <option value="IVB">(970434) IndovinaBank</option>
                  <option value="IBK - HCM">(970456) IBKHCM</option>
                  <option value="IBK - HN">(970455) IBKHN</option>
                  <option value="HSBC">(458761) HSBC</option>
                  <option value="HLBVN">(970442) HongLeong</option>
                  <option value="GPB">(970408) GPBank</option>
                  <option value="DOB">(970406) DongABank</option>
                  <option value="DBS">(796500) DBSBank</option>
                  <option value="CIMB">(422589) CIMB</option>
                  <option value="CBB">(970444) CBBank</option>
                </select>
              </div>
              <div className="form-group">
                <label>Account Number:</label>
                <input
                  type="password"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value) || ""}
                  className="input"
                  autoComplete='false'
                />
              </div>
              <div className="form-group amount-group">
                <label>Amount:</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input"
                  />
                  <div
                    className="max-button"
                    onClick={handleMaxClick}
                  >
                    Max
                  </div>
                </div>
                </div>
              <div className="modal-actions">
                <button type="submit" className="update-button refund-submit-button">
                  Submit
                </button>
                <button type="button" className="cancel-button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  );
};

export default RefundModal;
