import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notification = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={1500}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      limit={2}
      className="mt-16 sm:mt-20"
      toastClassName="text-xs sm:text-sm w-[90%] sm:max-w-sm mx-auto sm:mx-0 p-2 sm:p-3 rounded-lg shadow-md"
      bodyClassName="text-xs sm:text-sm"
    />
  );
};

export default Notification;