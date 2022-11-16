import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwt from "jwt-decode";
import { UserService } from "services/userServices";
import { useNavigate } from "react-router-dom";


function Home({ setUser }) {
    const navigate = useNavigate();
    const authenticate = (credentialResponse) => {
        const { email, name } = jwt(credentialResponse.credential);
        let res = new UserService().post("/authenticate", {
            email,
            name,
        });
        res.then((response) => {
            if (response.status === 200 || response.status === 201) {
                setUser(response.data);
                navigate("/dashboard");
            } else {
                console.log(response.message);
            }
        });
    };

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <div className="App">
                <header className="App-header">
                    <GoogleLogin
                        onSuccess={(credentialResponse) => authenticate(credentialResponse)}
                        onError={() => console.log("Login Failed")}
                    />
                </header>
            </div>
        </GoogleOAuthProvider>
    )
}

export default Home;