/* eslint-disable no-unused-vars */
const swagger = "http://localhost:8081/swagger-ui/index.html#/"

// --------------------------------------------------------------------- //

// API BASES 

const API_BASE = 'http://localhost:8081'
const API_PATH_ADMIN = "/api/v1/admin/"
const API_PATH_USER = "/api/v1/user/"
const API_PATH_EMPLOYEE = "/api/v1/employee/"
const API_PATH_WAREHOUSE_MANAGER = "/api/v1/warehouse-manager/"

// API BASES 

// --------------------------------------------------------------------- //

// USER API`s

export const API_PASS_RECOVER = API_BASE + API_PATH_USER + "password/reset-invite?Invite-token="

export const API_UPDATE_USERNAME = API_BASE + API_PATH_USER + "profile/"

export const API_NEW_PASSWORD = API_BASE + API_PATH_USER + "password/reset/"

export const API_CREATE_COMPANY_ADMIN = API_BASE + API_PATH_USER + "sign-up"

export const API_EMAIL_GENERATE = API_BASE + API_PATH_USER + "email/generate"

export const API_EMAIL_VERIFY = API_BASE + API_PATH_USER + "email/verify"

export const API_GET_PROFILE = API_BASE + API_PATH_USER + "profile"

export const API_GET_ORGANIZATION = API_BASE + API_PATH_USER + "organization"


// USER API`s

// --------------------------------------------------------------------- //
// WAREHOUSE-MANAGER API`s
export const API_GET_WAREHOUSE_LIST = API_BASE + API_PATH_EMPLOYEE + "warehouses"

export const API_CREATE_WAREHOUSE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouses"

export const API_DELETE_WAREHOUSE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouses/"
// --------------------------------------------------------------------- //

// ADMIN API`s

export const API_CHANGE_ROLE = API_BASE + API_PATH_ADMIN + "user/"

export const API_SUPER_ADMIN_DELETE_USER = API_BASE + API_PATH_ADMIN + "user/"

export const API_CREATE_INVITE = API_BASE + API_PATH_ADMIN + "invite"

export const API_GET_INVITE_LIST = API_BASE + API_PATH_ADMIN + "invites"

export const API_GET_USERS = API_BASE + API_PATH_ADMIN + "user"

export const API_GET_ACTION_LOGS = API_BASE + API_PATH_ADMIN + "log/action-logs"

export const API_GET_LOGIN_LOGS = API_BASE + API_PATH_ADMIN + "log/login-logs"

export const API_GET_EXCEPTION_LOGS = API_BASE + API_PATH_ADMIN + "log/exception-logs"

export const API_PUT_ORGANIZATION = API_BASE + API_PATH_ADMIN  + "organization"


// ADMIN API`s

// --------------------------------------------------------------------- //


// AUTH API

export const API_SIGN_IN = API_BASE + "/api/v1/auth/sign-in"

export const API_SIGN_OUT = API_BASE + "/api/v1/auth/sign-out"

// AUTH API




// (1, 'SuperAdmin1', '$2a$12$W3qpaw./1DZy/t3elNdtjeo.rttSOnPWywU.8tdOuWgTwNGIWvmhq', 'superAdmin1@gmail.com', '+77011112235', CURRENT_TIMESTAMP, false),
// (2, 'SuperAdmin2', '$2a$12$TxN7SBjj.MbnlQz9mnDA2e8dbEq7bZsPH5P7cNBKlukBnq3VukVFW', 'erkebulanzholdaskali@gmail.com', '+77478708845', CURRENT_TIMESTAMP, false),
// (3, 'Zhanserik Bazarov', '$2y$12$JLiDke/BgzxT2bEb94a8j.59p/6l/Bv3CXKv6ayuVlBH5NczxrhxG', 'zhako.bazarov2@gmail.com', '+77011112233', CURRENT_TIMESTAMP, false),
// (4, 'Erkebulan Zholdaskali', '$2y$12$k9HNEVryFIH7BL9Lir4Av.WBAEIgptJVt5NoHI15gY5VF7zpBTgfi', 'zholdaskalierkebulan@gmail.com', '+77011112234', CURRENT_TIMESTAMP, false);


//             {"userName": "superAdmin1@gmail.com",
//                 "password": "TorgutOzalaqasqirAdminkz02"
//             }
//             {
//                "userName": "erkebulanzholdaskali@gmail.com",
//                "password": "ErkebulanAdmin0404"
//    }
