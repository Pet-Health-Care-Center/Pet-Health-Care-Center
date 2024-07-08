const admin = require('../database/firebaseAdmin');
const { getDatabase, ref, get, set, update, child } = require('firebase/database');
const { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } = require('firebase/auth');
const { format } = require('date-fns');
const { auth } = require('firebase-admin');
const nodemailer = require('../config/nodemailer.config');

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const userRecord = await admin.auth().getUser(uid);
    const creationTime = new Date(userRecord.metadata.creationTime).toUTCString();
    console.log(decodedToken)

    const db = getDatabase();
    const userRef = ref(db, `users/${uid}`);
    const userDataSnapshot = await get(userRef);

    let userData = userDataSnapshot.exists() ? userDataSnapshot.val() : null;
    let userRole = "user";
    userRole = userData.role || "user";
    const  avatar = 'https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png'
    

    if (!userData) {
      userData = {
        email: email,
        username: `gg${email.split('@')[0]}`,
        role: userRole,
        isVerified: true,
        accountBalance: 0,
        accountStatus: 'enable',
        creationTime: creationTime,
        avatar: userData.avatar || avatar,
      };
      await set(userRef, userData);
    } else {
      userData = {
        ...userData,
        email: email,
        username: `gg${email.split('@')[0]}`,
        role: userRole,
        isVerified: true,
        accountBalance: 0,
        accountStatus: 'enable',
        creationTime: creationTime,
        avatar: userData.avatar || avatar,
      };
      await update(userRef, userData);

      if (userData.accountBalance === undefined) {
        await update(userRef, {
          accountBalance: 0,
        });
      }
    }

    res.status(200).json({ success: "Login successfully!" });
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    res.status(500).json({ error: error.message });
  }
};

const registerUser = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Password does not match, please try again!' });
  }

  const username = email.split('@')[0];
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;

  if (!expression.test(email)) {
    return res.status(400).json({ error: 'Email is invalid. Please enter a valid email address.' });
  }

  const auth = getAuth();
  const db = getDatabase();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);
    await updateProfile(user, {
      displayName: username
    });

    const userId = user.uid;
    const userData = {
      email: user.email,
      username: username,
      role: 'user',
      isVerified: false,
      accountBalance: 0,
      accountStatus: 'enable',
      creationTime: user.metadata.creationTime,
      avatar: 'https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png'
    };

    await set(ref(db, `users/${userId}`), userData);
    await auth.signOut();

    return res.status(200).json({ message: 'Registration successful. Please check your email for verification then login to our system again.' });
  } catch (error) {
    return res.status(400).json({ error: 'This email is used by another user, please try again!' });
  }
};

const emailLogin = async (req, res) => {
  const { idToken } = req.body;
  console.log("Received ID Token:", idToken); // Log ID Token nhận được

  try {
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("Decoded Token:", decodedToken); // Log token đã được giải mã
    const userId = decodedToken.uid;

    // Get user data from Firebase Authentication
    const user = await admin.auth().getUser(userId);
    console.log("User Data:", user); // Log dữ liệu người dùng

    const userEmail = user.email;

    // Kiểm tra và gửi lại email xác minh nếu cần thiết
    if (!decodedToken.email_verified && !user.emailVerified) {
      const link = await admin.auth().generateEmailVerificationLink(userEmail);
      try {
        const mailOptions = {
          from: 'your-email@gmail.com',
          to: userEmail,
          subject: 'Verify your email for veterinaryClinic',
          html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
        };

        await nodemailer.sendMail(mailOptions);
        await admin.auth().signOut();
        return res.status(400).json({ message: 'Email not verified. Verification email has been resent.' });
      } catch (verificationError) {
        console.error("Error resending verification email:", verificationError);
        return res.status(500).json({ message: 'Failed to resend verification email.' });
      }
    }

    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);
    let userRole = "user";
    const creationTime = new Date(user.metadata.creationTime).toUTCString();

    const creationTimeSnapshot = await get(child(userRef, "creationTime"));
    if (!creationTimeSnapshot.exists()) {
      await set(child(userRef, "creationTime"), creationTime);
    }

    let accountStatus = "enable";

    const userDataSnapshot = await get(userRef);
    let userData = userDataSnapshot.exists() ? userDataSnapshot.val() : null;

    const defaultAvatar = "https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png";

    if (!userData) {
      userData = {
        email: userEmail,
        username: user.displayName || "User",
        role: userRole,
        isVerified: true,
        accountBalance: 0,
        accountStatus: accountStatus,
        avatar: defaultAvatar,
      };
      await set(userRef, userData);
    } else {
      userRole = userData.role || "user";
      if (userData.accountBalance === undefined) {
        await update(userRef, {
          accountBalance: 0,
        });
      }

      await update(userRef, {
        username: user.displayName || "User",
        role: userRole,
        isVerified: userData.isVerified,
        accountStatus: userData.accountStatus || accountStatus,
        avatar: userData.avatar || defaultAvatar,
      });
      userData = { ...userData, avatar: userData.avatar || defaultAvatar };
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: 'Failed to login. Please check your email and password.' });
  }
};



module.exports = { googleLogin, registerUser, emailLogin };
