// ===============================
// Form Mode
// ===============================

let signupMode = false;


// ===============================
// Toggle Login / Signup
// ===============================

function toggleForm() {

    signupMode = !signupMode;

    const nameGroup =
        document.getElementById("nameGroup");

    const title =
        document.getElementById("formTitle");

    const subtitle =
        document.getElementById("formSubtitle");

    const submitText =
        document.getElementById("submitText");

    const switchText =
        document.getElementById("switchText");

    const switchBtn =
        document.getElementById("switchBtn");


    if (signupMode) {

        nameGroup.classList.remove("hidden");

        title.textContent =
            "Create Account";

        subtitle.textContent =
            "Create your new account";

        submitText.textContent =
            "Sign Up";

        switchText.textContent =
            "Already have an account?";

        switchBtn.textContent =
            "Login";

    } else {

        nameGroup.classList.add("hidden");

        title.textContent =
            "Welcome Back";

        subtitle.textContent =
            "Login to your account";

        submitText.textContent =
            "Login";

        switchText.textContent =
            "Don't have an account?";

        switchBtn.textContent =
            "Sign Up";
    }


    document.getElementById("message").textContent = "";
}


// ===============================
// Signup / Login
// ===============================

async function submitAuth() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");


    let name = "";

    if (signupMode) {

        name =
            document.getElementById("name").value.trim();
    }


    // Validation

    if (
        !email ||
        !password ||
        (signupMode && !name)
    ) {

        showMessage(
            "Please fill in all fields.",
            "error"
        );

        return;
    }


    // Email validation

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        return;
    }


    // Password validation

    if (password.length < 6) {

        showMessage(
            "Password must be at least 6 characters.",
            "error"
        );

        return;
    }


    try {

        const endpoint =
            signupMode
                ? "/api/signup"
                : "/api/login";


        const body =
            signupMode
                ? {
                    name: name,
                    email: email,
                    password: password
                }
                : {
                    email: email,
                    password: password
                };


        const response =
            await fetch(endpoint, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(body)
            });


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                data.message ||
                "Something went wrong.",
                "error"
            );

            return;
        }


        // Signup success

        if (signupMode) {

            showMessage(
                "Account created successfully! Please login.",
                "success"
            );

            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";

            setTimeout(() => {
                toggleForm();
            }, 1000);

            return;
        }


        // Login success

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );


        window.location.href =
            "dashboard.html";

    } catch (error) {

        showMessage(
            "Unable to connect to server.",
            "error"
        );

        console.error(error);
    }
}


// ===============================
// Message
// ===============================

function showMessage(text, type) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    if (type === "success") {

        message.style.color =
            "#22c55e";

    } else {

        message.style.color =
            "#ef4444";
    }
}


// ===============================
// Load Dashboard
// ===============================

async function loadDashboard() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "index.html";

        return;
    }


    try {

        const response =
            await fetch(
                "/api/profile",
                {
                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "index.html";

            return;
        }


        const user =
            data.user;


        document.getElementById(
            "userName"
        ).textContent =
            user.name;


        document.getElementById(
            "profileName"
        ).textContent =
            user.name;


        document.getElementById(
            "profileEmail"
        ).textContent =
            user.email;


    } catch (error) {

        console.error(error);

        window.location.href =
            "index.html";
    }
}


// ===============================
// Logout
// ===============================

async function logout() {

    const token =
        localStorage.getItem("token");


    try {

        await fetch(
            "/api/logout",
            {
                method: "POST",
                headers: {
                    Authorization:
                        "Bearer " + token
                }
            }
        );

    } catch (error) {

        console.log(error);
    }


    localStorage.removeItem("token");
    localStorage.removeItem("user");


    window.location.href =
        "index.html";
}


// ===============================
// Automatically Load Dashboard
// ===============================

if (
    window.location.pathname.includes(
        "dashboard.html"
    )
) {

    loadDashboard();
}