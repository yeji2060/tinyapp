# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

- First, you can login or register.
![](/photos/Screenshot_0.png)

- You will need your email and password for registration.
![](/photos/Screenshot_1.png)

- After the registration / login, you will see your email address on the right top corner and you can create new shorten URL.
![](/photos/Screenshot_2.png)

- Your new shorten URL will be shown on web page.
![](/photos/Screenshot_3.png)

- You can edit long URL with update button.
![](/photos/Screenshot_4.png)



## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Instruction

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

- Register your new user account with email address and the password. (password would be stored securely)
- After registeration, you can create a new shorten URL with long URL.
- Each user only can access to their own shorten URLs.
- u/:id(shorten URL) would redirect to the matching long URL.



