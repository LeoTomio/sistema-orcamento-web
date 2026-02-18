import type { User } from "./User";

let users: User[] = []

const loginService = {
    login: (email: string, password: string) => {
        if (email === "t@t.com" && password === "1") {
            return true
        } else {
            return false
        }
    },


    create: (budget: User) => {
        users.push(budget);
    },
};

export default loginService