import React, { useState, useEffect, useRef } from "react";
import { auth, provider, database } from "../firebase/firebase"; 
import {
  signInWithPopup,
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";
import Home from "../../view/partials/Home";
import { useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
} from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ref,
  update,
} from "firebase/database";
import useForceUpdate from "../../hooks/useForceUpdate";
import ReCAPTCHA from "react-google-recaptcha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { googleLogin, registerUser, emailLogin } from "./utils";
import LoadingAnimation from "../../animation/loading-animation";

function SignIn() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState(null); // Track logged-in user email
  const [error, setError] = useState(null); // Store error messages
  const [confirmPassword, setconfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(null);
  const [signInMethod, setSignInMethod] = useState(null);
  const navigate = useNavigate();
  const forceUpdate = useForceUpdate();
  const [retry, setRetry] = useState(0);
  const [isInactive, setIsInactive] = useState(false);
  const inactivityTimeoutRef = useRef(null);
  const [avatar, setAvatar] = useState(
    "https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (value) => {
    setIsCaptchaVerified(!!value);
    setCaptchaError(null);
  };
  const onErrored = () => {
    setCaptchaError("Failed to load reCAPTCHA. Please try again.");
  };

  const onExpired = () => {
    setIsCaptchaVerified(false);
    setCaptchaError("reCAPTCHA expired. Please verify again.");
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth();
      const result = await signInWithPopup(auth, provider);
      setLoading(true)
      const idToken = await result.user.getIdToken();
      console.log(idToken);
      
      const data = await googleLogin(idToken);
      const userRole = data.role;

      toast.success("Login successfully. Wish you enjoy our best experience", {
        autoClose: 2000,
        onClose: () => {
          switch (userRole) {
            case "veterinarian":
              navigate("/vet/dashboard");
              break;
            case "manager":
              navigate("/manager");
              break;
            case "admin":
              navigate("/admin/dashboard");
              break;
            default:
              navigate("/");
          }
        },
      });
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error("Failed to sign in with Google. Please try again.", {
        autoClose: 2000,
        onClose: () => {
          setLoading(false)
          forceUpdate(); // Equivalent to `forceUpdate()`
        },
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Password not match, please try again!", { autoClose: 2000 });
      return;
    }

    const userData = { email, password, confirmPassword };

    if (!isRegistering) {
      setIsRegistering(true);
      setLoading(true);
      try {
        const response = await registerUser(userData);
        toast.success(response.message, { autoClose: 2000 });
      } catch (error) {
        toast.error(error.error, { autoClose: 2000 });
      } finally {
        setLoading(false);
        setIsRegistering(false);
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "username") {
      setUsername(value);
    } else if (name === "confirmPassword") {
      setconfirmPassword(value);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError(null);

    if (!isCaptchaVerified) {
      toast.error("Please complete the captcha before submitting the form.");
      return;
    }

    try {
      setLoading(true); // Show spinner

      const response = await emailLogin(email, password);

      const userEmail = email;
      setUserEmail(userEmail);
      localStorage.setItem("email", userEmail);

      // Set avatar state here
      setAvatar(response.avatar);

      toast.success("Login successfully. Wish you enjoy our best experience!", {
        autoClose: 2000,
        onClose: () => {
          switch (response.role) {
            case "veterinarian":
              navigate("/vet/dashboard");
              break;
            case "manager":
              navigate("/manager/dashboard");
              break;
            case "admin":
              navigate("/admin/dashboard");
              break;
            default:
              navigate("/");
          }
          setLoading(false); // Hide spinner
        },
      });
    } catch (error) {
      console.error("Error during login:", error);

      if (
        error.response &&
        error.response.data.message ===
          "Email not verified. Verification email has been resent."
      ) {
        toast.error(
          "Please verify your email before logging in. A verification email has been sent to your email address.",
          {
            autoClose: 2000,
            onClose: () => {
              setLoading(false); // Hide spinner
              forceUpdate();
            },
          }
        );
      } else {
        toast.error("Failed to login. Please check your email and password.", {
          autoClose: 2000,
          onClose: () => {
            setLoading(false); // Hide spinner
            forceUpdate();
          },
        });
      }
    }
  };

  const handleClickButtonReg = async () => {
    const container = document.getElementById("container");
    container.classList.add("active");
  };
  const handleClickButtonLog = async () => {
    const container = document.getElementById("container");
    container.classList.remove("active");
  };

  useEffect(() => {
    const updateUserVerificationStatus = async (user) => {
      if (user && user.emailVerified) {
        const userRef = ref(database, "users/" + user.uid);
        await update(userRef, { isVerified: true });
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        updateUserVerificationStatus(user);
      }
    });

    return () => unsubscribe();
  }, []);
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimeoutRef.current);
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsInactive(true);
      setCaptchaError(
        "You have been inactive for a while. Please verify reCAPTCHA again."
      );
    }, 5 * 60 * 1000); // 5 minutes inactivity timeout
  };

  const handleRetry = () => {
    setRetry(retry + 1);
    setCaptchaError(null);
    setIsInactive(false);
    resetInactivityTimer();
  };
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  const togglePasswordConfirmVisibility = () => {
    setShowConfirmPassword((prevState) => !prevState);
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => clearTimeout(inactivityTimeoutRef.current);
  }, []);

  return (
    <div>
      {!userEmail && (
        <div className="signIn" style={{ height: "100vh" }}>
          {loading && <LoadingAnimation />}
          <div className="container form" id="container">
            <div className="form-container sign-up">
              <form onSubmit={onSubmit}>
                <h1>Create Account</h1>
                <div className="social-icons">
                  <button type="button" onClick={handleGoogleLogin}>
                    Login with Google
                  </button>
                </div>
                <span>or use your email for registeration</span>
                <input
                  id="email"
                  type="email"
                  autoComplete="off"
                  required
                  value={email}
                  placeholder="Input your email"
                  onChange={(e) => {
                    setEmail(e.target.value || "");
                  }}
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                />
                <div class="input-wrapper">
                  <input
                    id="password"
                    disabled={isRegistering}
                    placeholder="Input your password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="off"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value || "");
                    }}
                  />
                  <div
                    class="toggle-password"
                    onClick={togglePasswordVisibility}
                  >
                    <FontAwesomeIcon
                      id="toggleIcon"
                      icon={showPassword ? faEyeSlash : faEye}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-bold">
                    Confirm Password
                  </label>
                  <div class="input-wrapper">
                    <input
                      disabled={isRegistering}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      autoComplete="off"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setconfirmPassword(e.target.value || "");
                      }}
                    />
                    <div
                      class="toggle-password"
                      onClick={togglePasswordConfirmVisibility}
                    >
                      <FontAwesomeIcon
                        id="toggleIcon"
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className={`px-4 py-2 text-white font-medium rounded-lg ${
                    isRegistering
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300"
                  }`}
                >
                  {isRegistering ? "Signing Up..." : "Sign Up"}
                </button>
              </form>
            </div>
            <div className="form-container sign-in">
              <form onSubmit={handleEmailLogin}>
                <h1>Sign In</h1>
                <div className="social-icons">
                  <button type="button" onClick={handleGoogleLogin}>
                    Login with Google
                  </button>
                </div>
                <span>or use your email password</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Input your email"
                  value={email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  placeholder="Input your password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  required
                />
                <a href="/reset">Forget Your Password?</a>

                {!isInactive && (
                  <ReCAPTCHA
                    key={retry} // This forces re-rendering of the component on retry
                    sitekey="6LfjlPcpAAAAAPLRaxVhKzYI4OYR2mBW_wv6LZwW"
                    onChange={onChange}
                    onErrored={onErrored}
                    onExpired={onExpired}
                  />
                )}
                {captchaError && (
                  <div style={{ color: "red" }}>
                    {captchaError}
                    {isInactive && <button onClick={handleRetry}>Retry</button>}
                  </div>
                )}
                <button disabled={!isCaptchaVerified}>Sign In</button>
              </form>
            </div>
            <div className="toggle-container">
              <div className="toggle">
                <div className="toggle-panel toggle-left">
                  <h1>Welcome Back!</h1>
                  <p>Enter your personal details to use all of site features</p>
                  <button
                    className="hidden"
                    id="login"
                    onClick={handleClickButtonLog}
                  >
                    Sign In
                  </button>
                </div>
                <div className="toggle-panel toggle-right">
                  <h1>Hello, Friend!</h1>
                  <p>
                    Register with your personal details to use all of site
                    features
                  </p>
                  <button
                    className="hidden"
                    id="register"
                    onClick={handleClickButtonReg}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
      {userEmail && <Home />}
    </div>
  );
}

export default SignIn;
