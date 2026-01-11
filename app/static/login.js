document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const otpContainer = document.getElementById("otpContainer");
    const verifyBtn = document.getElementById("verifyBtn");
    const otpInput = document.getElementById("otp");

    const API_BASE_URL = window.location.origin;

    /* ------------------ UI UTILITIES ------------------ */
    const showError = (id, message) => {
        document.getElementById(id).innerText = message;
    };

    const clearError = (id) => {
        document.getElementById(id).innerText = "";
    };
    
    const showSuccess = (id, message) => {
        document.getElementById(id).innerText = message;
    };

    /* ------------------ STEP 1: SEND OTP ------------------ */
    sendOtpBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        clearError("emailError");

        // Email validation
        if (!email || !email.includes("@")) {
            showError("emailError", "Please enter a valid email address.");
            emailInput.focus();
            return;
        }

        // Add loading spinner
        sendOtpBtn.innerHTML = 'Sending <span class="spinner"></span>';
        sendOtpBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "OTP request failed");
            }

            localStorage.setItem("email", email);

            // Success feedback
            sendOtpBtn.innerHTML = '✓ OTP Sent!';
            sendOtpBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            setTimeout(() => {
                sendOtpBtn.classList.add("hidden");
                otpContainer.classList.add("active");
                otpInput.focus();
            }, 800);

        } catch (error) {
            showError("emailError", error.message || "Unable to send OTP. Try again.");
            sendOtpBtn.innerHTML = "Send OTP";
            sendOtpBtn.disabled = false;
        }
    });
    
    // Allow Enter key to send OTP
    emailInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !sendOtpBtn.disabled) {
            sendOtpBtn.click();
        }
    });

    /* ------------------ STEP 2: VERIFY OTP ------------------ */
    verifyBtn.addEventListener("click", async () => {
        const otp = otpInput.value.trim();
        const email = localStorage.getItem("email");
        clearError("otpError");
        document.getElementById("otpSuccess").innerText = "";

        if (!/^\d{6}$/.test(otp)) {
            showError("otpError", "Please enter a valid 6-digit OTP.");
            otpInput.focus();
            return;
        }

        verifyBtn.innerHTML = 'Verifying <span class="spinner"></span>';
        verifyBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, otp: otp })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Invalid OTP");
            }

            const data = await response.json();

            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("role", data.role);

            // Success animation
            verifyBtn.innerHTML = '✓ Success!';
            verifyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            showSuccess("otpSuccess", `✓ Verified! Redirecting to ${data.role} dashboard...`);

            setTimeout(() => {
                if (data.role === "admin") {
                    window.location.href = "/static/admin.html";
                } else {
                    window.location.href = "/static/user.html";
                }
            }, 1000);

        } catch (error) {
            showError("otpError", error.message || "Invalid or expired OTP.");
            verifyBtn.innerHTML = "Verify & Login";
            verifyBtn.disabled = false;
            otpInput.value = "";
            otpInput.focus();
        }
    });
    
    // Allow Enter key to verify OTP
    otpInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !verifyBtn.disabled) {
            verifyBtn.click();
        }
    });
    
    // Auto-format OTP input (only numbers)
    otpInput.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
});
