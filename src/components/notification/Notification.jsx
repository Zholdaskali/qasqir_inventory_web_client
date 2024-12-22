import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

const Notification = () => {
    return (
        <div>
            <ToastContainer
                position="top-center"
                autoClose={2000}
            />
        </div>
    );
}

export default Notification;
