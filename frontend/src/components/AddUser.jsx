import { useState } from "react";
import {
    Typography,
    TextField,
    Button,
    Paper,
} from "@mui/material";
import ErrorMessage from "./ErrorMessage";
import SideBar from "./SideBar";
import { Box } from "@mui/system";
import adminServices from "../services/admin";

const AddUser = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const user = JSON.parse(
        localStorage.getItem("loggedAcademicTrackingAdmin")
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const username = formData.get("username");
        const password = formData.get("password");
        const email = formData.get("email");
        console.log(username, password, email);
        if (!username || !password || !email) {
            setErrorMessage("Missing username or password or email");
            setTimeout(() => {
                setErrorMessage("");
            }, 5000);
            return;
        }
        const credentials = {
            username,
            email,
            password,
        };

        adminServices.setToken(user?.token);
        adminServices
            .createUser(credentials)
            .then(() => {
                alert("User Created Successfully!!!");
                event.target.reset();
            })
            .catch((error) => {
                if (error.message) {
                    setErrorMessage(error.message);
                    setTimeout(() => {
                        setErrorMessage("");
                    }, 5000);
                } else {
                    setErrorMessage(
                        "Error logging in : Please check the console for more details"
                    );
                    console.error(error);
                    setTimeout(() => {
                        setErrorMessage("");
                    }, 5000);
                }
            });
    };

    return (
        <SideBar>
            <ErrorMessage errorMessage={errorMessage} />
            <Box display="flex">
                <Box flexGrow={1}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "85vh",
                        }}
                    >
                        <Paper style={{ padding: 24, borderRadius: 8 }}>
                            <Typography
                                variant="h5"
                                align="center"
                                gutterBottom
                            >
                                Create User
                            </Typography>
                            <form onSubmit={handleSubmit}>
                                <div style={{ width: "100%" }}>
                                    <TextField
                                        label="Username"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        id="username"
                                        name="username"
                                    />
                                    <TextField
                                        label="Email"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        type="email"
                                        id="email"
                                        name="email"
                                    />
                                    <TextField
                                        label="Password"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        type="password"
                                        id="password"
                                        name="password"
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        style={{ marginTop: 24 }}
                                        fullWidth
                                        type="submit"
                                    >
                                        Create
                                    </Button>
                                </div>
                            </form>
                        </Paper>
                    </div>
                </Box>
            </Box>
        </SideBar>
    );
};

export default AddUser;
