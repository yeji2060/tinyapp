const express = require("express");
const { getUserByEmail } = require('./helpers.js');

const session = require('cookie-session');
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "vI3w6n",
  },
};

//password for the first user here is "abcd".
const users = {
  aJ48lW: { 
    id: "aJ48lW",
    email: "a@a.com",
    password: "$2a$10$XY0WojEuddlWutPL8xAeWuhzS.f6OrMF2oDZzcw9qgBfPjL8OvNj.",
  },
  vI3w6n: {
    id: "vI3w6n",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieSession ({
  name: "user_ID",
  keys: ["secret"]
}))

app.get("/",checkLoggedIn, (req, res) => {
  
  res.redirect("/urls");
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {

  const user_ID = req.session.user_ID;
  const user = users[user_ID];
  const userURLs = urlsForUser(user_ID);

   if (!user_ID || !users[user_ID]) {
    res.status(401).send('You must be logged in first. Please go to /login in order to log in or go to /register for registration');
  };

  const templateVars = { 
    urls: userURLs,
    user,
    user_ID
  };


  res.render("urls_index", templateVars);
});

app.get("/urls/new", checkLoggedIn, (req, res) => {
  const user_ID = req.session.user_ID;
  const user = users[user_ID];

  const templateVars = {
    user,
    user_ID
  }

  res.render("urls_new", templateVars);
});

app.post("/urls/new",checkLoggedIn, (req, res) => {

  const newId = generateRandomString();

  urlDatabase[newId] = {
    longURL: req.body.longURL,
    userID: req.session.user_ID
  }

  res.redirect("/urls");
})

app.post("/urls",checkLoggedIn, (req, res) => {

  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id",checkUrlID, (req, res) => {

  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;

  if(!longURL) {
    res.status(404).send('URL not found');
  } else {
    res.redirect(longURL);
  }
});

app.get("/urls/:id",checkUrlID, authenticateUser,  (req,res) => {

  const user_ID = req.session.user_ID;
  const user = users[user_ID];
  const userURLs = urlsForUser(user_ID);


  const templateVars = {
    urlDatabase: userURLs,
    id: req.params.id,
    longURL: userURLs[req.params.id],
    newURL: req.params.newURL,
    user,
    user_ID
  };

  res.render("urls_show", templateVars);

})


app.post("/urls/:id",checkUrlID, authenticateUser, (req, res) => {
  const id = req.params.id;
  const newURL = req.body.newURL;

  if (urlDatabase[id]) {
    urlDatabase[id].longURL = newURL;
    res.redirect('/urls');
  } else {
    res.status(404).send('URL not found');
  }
});

app.post("/urls/:id/delete",checkUrlID, authenticateUser,  (req, res) => {
  const id = req.params.id;

  if(urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    res.status(404).send('URL not found');
  }
});

app.get("/login", (req, res) => {
  

  const templateVars = {
    users: users,
    user_ID: req.session.user_ID
  }

  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  const userObj = getUserByEmail(req.body.email, users);

  if(userObj && bcrypt.compareSync(req.body.password, userObj.password)){
    req.session.user_ID = userObj.id;
    res.redirect("/urls");
  } else {
    res.status(400).send('Email or password is incorrect')
  }
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.get("/register", (req, res) => {

  const templateVars ={ 
    users: users,
    user_ID: null
  }
  res.render("urls_register",templateVars);
})


app.post("/register", (req, res) => {

  if(req.body.email == null || req.body.password == null) {
    res.status(400).send('email/password are empty');
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('email is already exist');
  } else {
    const newId = generateRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log("++++++++++", hashedPassword);
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: hashedPassword
    }

    console.log(users[newId]);
    req.session.user_ID = newId; 
    console.log("ASSIGNED", users[newId]);

    res.redirect('/urls');
  }

})

function generateRandomString() {
  const alphanumericCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumericCharacters.length);
    randomString += alphanumericCharacters.charAt(randomIndex);
  }
  return randomString;
};


function authenticateUser(req, res, next) {
  const user_ID = req.session.user_ID;
  if(user_ID && users[user_ID]) {
    if (urlDatabase[req.params.id]?.userID === user_ID ) {
      next(); 
    } else {
      res.status(403).send("You do not have permisson");
    }
  } else {
    if (req.method === "GET") {
      res.redirect(403, '/login');
    } else {
      res.status(401).send('You must be logged in first');
    }
  }
}

function checkLoggedIn(req, res, next) { 
  const user_ID = req.session.user_ID;
   if (user_ID && users[user_ID]) {
    next();
   } else {
    res.redirect(302, "/login");
   }
}

function checkUrlID (req, res, next) {

   const requestedURL = urlDatabase[req.params.id];

  if (requestedURL === undefined) {
    res.status(404).send("URL short ID is not existed"); 
  } else {
    next();
  }
}


function urlsForUser(id) {
  const userURLs = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }

  return userURLs;
}