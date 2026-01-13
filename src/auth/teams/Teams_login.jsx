import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Avatar,
    useTheme,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar

} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { ArrowBack, Person } from "@mui/icons-material";
import { teamsSendOtp, verifyOtp } from "../../service/Teams/Teams_auth";
import { postSelectAccount } from "../../service/Teams/SelectAccount";

const Teams_login = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    const [accountData, setAccountData] = useState(null);
    const [accountMessage, setAccountMessage] = useState("");

    const [step, setStep] = useState(1); // 1: phone, 1.5: account selection, 2: OTP
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    

    // Refs for OTP input fields
    const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            const from = location.state?.from || '/teams/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Auto-focus first OTP input when step changes to 2
    useEffect(() => {
        if (step === 2 && otpRefs[0].current) {
            otpRefs[0].current.focus();
        }
    }, [step]);

    // Format phone number
    const formatPhoneNumber = (value) => {
        const phone = value.replace(/\D/g, '');
        if (phone.length <= 10) {
            return phone;
        }
        return phone.slice(0, 10);
    };

    const handleSendOTP = async () => {
        setError("");
        setLoading(true);

        try {
            const res = await teamsSendOtp({ phone: phoneNumber });
            console.log('send OTP response:', res);

            // Check if multiple accounts exist
            if (res.data?.accounts && res.data.accounts.length > 1) {
                // Multiple accounts found, show account selection
                setAccountData(res.data);
                setAccountMessage(res.message);
                setStep(1.5);
            } else {
                // Single account or no accounts, move to OTP verification
                setAccountData(res.data);
                setStep(2);
                setResendTimer(120); // 120 seconds = 2 minutes
            }
        } catch (err) {
            setError(err.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError("");
        setLoading(true);

        try {
            const otpString = otp.join("");

            // Call verifyOtp API
            const response = await verifyOtp({
                phone: phoneNumber,
                otp: otpString
            });


            // Extract token from response
            const token = response.data?.token || response.token;
            if (!token) {
                setError("Invalid response from server. Token not found.");
                return;
            }
            // Use the auth context login function
            const success = await login(token, 'team');
            console.log('Login success:', success);
            if (success) {
                const from = location.state?.from || '/teams/dashboard';
                navigate(from, { replace: true });
            } else {
                setError("Failed to authenticate. Please try again.");
            }
        } catch (err) {
            setError(err.message || "OTP verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (index, value) => {
        // Only allow single digit
        const digit = value.replace(/\D/g, '').slice(-1);

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (digit && index < 3) {
            otpRefs[index + 1].current?.focus();
        }
    };

    const handleOTPKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }

        // Handle Enter key
        if (e.key === 'Enter' && otp.every(digit => digit) && !loading) {
            handleVerifyOTP();
        }
    };

    const handleOTPPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);

        if (pastedData.length === 4) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            otpRefs[3].current?.focus();
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setOtp(["", "", "", ""]);
        setError("");
        await handleSendOTP();
    };

    const handleBackToPhone = () => {
        setStep(1);
        setOtp(["", "", "", ""]);
        setError("");
    };

    const handleAccountSelection = async (selectedAccount) => {
        setError("");
        setLoading(true);

        try {
            const requestData = {
                phone: phoneNumber,
                team_member_id: selectedAccount.id,
                client_id: selectedAccount.client_id
            };

            const response = await postSelectAccount(requestData);
            console.log('Account selection response:', response);

            // Move to OTP verification step
            setStep(2);
            setResendTimer(120); // 120 seconds = 2 minutes
        } catch (err) {
            setError(err.message || "Failed to select account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key press for phone input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading && step === 1 && phoneNumber) {
            handleSendOTP();
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.creme,
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
            }}
        >
            <Container
                maxWidth="xs"
                sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 5,
                    boxShadow: 2,
                    p: 4,
                    textAlign: "center",
                    position: "relative",
                }}
            >
                {/* Back Button - Show on account selection and OTP step */}
                {(step === 1.5 || step === 2) && (
                    <IconButton
                        onClick={() => {
                            if (step === 1.5) {
                                setStep(1);
                                setError("");
                            } else {
                                handleBackToPhone();
                            }
                        }}
                        disabled={loading}
                        sx={{
                            position: "absolute",
                            left: 16,
                            top: 16,
                            color: theme.palette.secondary.main,
                        }}
                    >
                        <ArrowBack />
                    </IconButton>
                )}

                {/* Logo and App Name */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 1, mt: step !== 1 ? 2 : 0 }}>
                    <Avatar
                        src="../images/logo.png"
                        alt="Beck HolidayHomes Logo"
                        sx={{ width: 64, height: 64, mb: 1 }}
                    />
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ color: theme.palette.text.primary }}
                    >
                        Beck HolidayHomes
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        {step === 1 ? 'Team Login' : step === 1.5 ? 'Select Your Account' : 'Enter Your OTP code here'}
                    </Typography>
                </Box>

                {step === 1 ? (
                    <>
                        {/* Phone Number Field */}
                        <TextField
                            fullWidth
                            name="phoneNumber"
                            type="tel"
                            required
                            autoFocus
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                            onKeyPress={handleKeyPress}
                            variant="outlined"
                            margin="normal"
                            error={!!error}
                            disabled={loading}
                            placeholder="Enter 10-digit phone number"
                        />

                        {/* Error Message */}
                        {error && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "error.main",
                                    mt: 1,
                                    textAlign: "left",
                                }}
                            >
                                {error}
                            </Typography>
                        )}

                        {/* Send OTP Button */}
                        <Button
                            fullWidth
                            variant="contained"
                            disableElevation
                            onClick={handleSendOTP}
                            // disabled={loading || !phoneNumber || phoneNumber.length < 10}
                            sx={{
                                mt: 3,
                                py: 1.2,
                                backgroundColor: theme.palette.primary.main,
                                "&:hover": { backgroundColor: "#326655" },
                                "&:disabled": { backgroundColor: "#9db5a9" },
                                fontWeight: "bold",
                                borderRadius: 2,
                                textTransform: "none",
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Send OTP"}
                        </Button>
                    </>
                ) : step === 1.5 ? (
                    <>
                        {/* Account Selection Step */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2,  }}>
                            
                               {accountMessage || "Multiple accounts found. Please select one to continue."}
                            </Typography>

                            {accountData?.accounts?.map((account) => (
                                // use list items for better accessibility
                                <List key={account.id} disablePadding 
                                sx={{
                                     mb: 1,
                                     opacity: account.is_active_subscription === false ? 0.5 : 1,
                                     }}
                                >
                                    <ListItem
                                        button
                                        onClick={
                                            () => !loading && account.is_active_subscription !== false && handleAccountSelection(account)
                                        }
                                        // disabled={loading || account.is_active_subscription === false}
                                        sx={{
                                            border: `2px solid ${theme.palette.divider}`,
                                            borderRadius: 2,
                                            cursor: account.is_active_subscription === false ? 'not-allowed' : 'pointer',
                                            '&:hover': {
                                                borderColor: account.is_active_subscription === false ? theme.palette.divider : theme.palette.primary.main,
                                                backgroundColor: theme.palette.action.hover,
                                            },
                                        }}
                                    >
                                        <ListItemAvatar>

                                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                                <Person />
                                            </Avatar>

                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                                                    {account.client_name}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                        Role: {account.role}
                                                    </Typography>
                                                    {account.is_active_subscription === false && (
                                                        <Typography variant="body2" sx={{ color: "error.main",}}>
                                                            Plan Expired
                                                        </Typography>
                                                    )}

                                                </>
                                            }
                                        />
                                    </ListItem>
                                </List>
                            ))}
                        </Box>

                        {/* Error Message */}
                        {error && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "error.main",
                                    mb: 2,
                                    textAlign: "center",
                                }}
                            >
                                {error}
                            </Typography>
                        )}

                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                    </>
                ) : (
                    <>
                        {/* OTP Verification Step */}
                        {/* OTP Input Fields */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 2,
                                mt: 3,
                                mb: 2,
                            }}
                        >
                            {otp.map((digit, index) => (
                                <TextField
                                    key={index}
                                    inputRef={otpRefs[index]}
                                    value={digit}
                                    onChange={(e) => handleOTPChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                    onPaste={index === 0 ? handleOTPPaste : undefined}
                                    variant="outlined"
                                    disabled={loading}
                                    inputProps={{
                                        maxLength: 1,
                                        style: {
                                            textAlign: "center",
                                            fontSize: "24px",
                                            fontWeight: "bold",
                                            padding: "16px",
                                        },
                                    }}
                                    sx={{
                                        width: "60px",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "12px",
                                            backgroundColor: digit ? theme.palette.primary.main : "transparent",
                                            "& fieldset": {
                                                borderColor: digit ? theme.palette.primary.main : theme.palette.divider,
                                                borderWidth: "2px",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: digit ? theme.palette.primary.main : theme.palette.primary.light,
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: theme.palette.primary.main,
                                            },
                                            "& input": {
                                                color: digit ? theme.palette.background.paper : theme.palette.text.primary,
                                            },
                                        },
                                    }}
                                />
                            ))}
                        </Box>

                        {/* Timer Display */}
                        {resendTimer > 0 && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    mb: 2,
                                }}
                            >
                                Time remaining: {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
                            </Typography>
                        )}

                        {/* Error Message */}
                        {error && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "error.main",
                                    mb: 2,
                                    textAlign: "center",
                                }}
                            >
                                {error}
                            </Typography>
                        )}

                        {/* Verify Button */}
                        <Button
                            fullWidth
                            variant="contained"
                            disableElevation
                            onClick={handleVerifyOTP}
                            // disabled={loading || !otp.every(digit => digit)}
                            sx={{
                                mt: 2,
                                py: 1.2,
                                backgroundColor: theme.palette.primary.main,
                                "&:hover": { backgroundColor: "#326655" },
                                "&:disabled": { backgroundColor: "#9db5a9" },
                                fontWeight: "bold",
                                borderRadius: 2,
                                textTransform: "none",
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
                        </Button>

                        {/* Resend OTP */}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Didn't receive OTP?
                            </Typography>
                            <Button
                                variant="text"
                                onClick={handleResendOTP}
                                disabled={resendTimer > 0 || loading}
                                sx={{
                                    ml: 1,
                                    textTransform: "none",
                                    color: theme.palette.primary.main,
                                    "&:disabled": { color: theme.palette.text.disabled }
                                }}
                            >
                                {resendTimer > 0 ? `Resend ` : "Resend"}
                            </Button>
                        </Box>
                    </>
                )}
            </Container>
        </Box>
    );
};

export default Teams_login;