const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

const validatePassword = (password) => {
    if (password.length < 8)
        return false;

    let spl = 0, num = 0, upper = 0;
    for (let char of password){
        if (/[A-Z]/.test(char)) 
            upper++;
        else if (/[0-9]/.test(char)) 
            num++;
        else if (/[^A-Za-z0-9]/.test(char)) 
            spl++;
    }
    return spl > 0 && num > 0 && upper > 0;
}

module.exports = { validateEmail, validatePassword };