const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

const users = {
  aJ48lW: { 
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  vI3w6n: {
    id: "vI3w6n",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
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
 

  const user_ID = req.cookies.user_ID;
  const userURLs = urlsForUser(user_ID);

  const templateVars = { 
    urls: userURLs,
    users: users,
    user_ID: req.cookies["user_ID"]
 };
  res.render("urls_index", templateVars);
});

app.get("/urls/new",checkLoggedIn,  (req, res) => {


  const templateVars = {
    users: users,
    user_ID: req.cookies["user_ID"]
  }
  res.render("urls_new", templateVars);
});

app.post("/urls/new",checkLoggedIn, (req, res) => {
  const newId = generateRandomString();

  urlDatabase[newId] = {
    longURL: req.body.longURL
  }

  res.redirect("/urls");
})

app.get("/urls/:id", checkUrlID, authenticateUser, (req, res) => {

  const user_ID = req.cookies.user_ID;
  const userURLs = urlsForUser(user_ID);

  const templateVars = { 
    urlDatabase: userURLs,
    id: req.params.id,
    longURL: userURLs[req.params.id], 
    users: users,
    user_ID: user_ID
  }

  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {

  console.log(req.body); // Log the POST request body to the console

  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {

  
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;

  if(!longURL) {
    res.status(404).send('URL not found');
  } else {
    res.redirect(longURL);
  }
  
});

app.get("/urls/:id", checkUrlID, authenticateUser, (req,res) => {


  const user_ID = req.cookies.user_ID;
  const userURLs = urlsForUser(user_ID);
  
  const templateVars = {
    urlDatabase: userURLs,
    id: req.params.id,
    longURL: userURLs[req.params.id],
    newURL: req.params.newURL,
    users: users,
    user_ID: req.cookies["user_ID"]
  }
;
  res.render("urls_show", templateVars);
})


app.post("/urls/:id", checkUrlID, authenticateUser, (req, res) => {

  const id = req.params.id;
  const newURL = req.body.newURL;

  if (urlDatabase[id]) {
    urlDatabase[id].longURL = newURL;
    res.redirect('/urls');
  } else {
    res.status(404).send('URL not found');
  }
});

app.post("/urls/:id/delete",checkUrlID, authenticateUser,(req, res) => {
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
    user_ID: req.cookies["user_ID"]
  }

  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  const userObj = getUserByEmail(req.body.email);

  if(getUserByEmail(req.body.email)){
    res.cookie("user_ID", userObj.id);
  } else {
    res.status(400).send('email is not correct')
  }

  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/urls");
});


app.get("/register", (req, res) => {

  const templateVars ={ 
    users: users,
    user_ID: req.cookies["user_ID"] 
  }

  res.render("urls_register",templateVars);
})


app.post("/register", (req, res) => {

  if(req.body.email == null || req.body.password == null) {
    res.status(400).send('email/password are empty');
  } else if (getUserByEmail(req.params.email)) {
    res.status(400).send('email is already exist');
  } else {
    const newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: req.body.password
    }

    console.log(users);
    res.cookie("user_ID", newId);
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

function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

function authenticateUser(req, res, next) {
  const user_ID = req.cookies.user_ID;
  if(user_ID && users[user_ID]) {
    if (urlDatabase[req.params.id]?.userID === user_ID ) {
      next(); 
    } else {
      res.status(403).send("You do not have permisson");
    }
  } else {
    if (req.method === "GET") {
      res.redirect('/login');
    } else {
      res.status(401).send('You must be logged in first');
    }
  }
}

function checkLoggedIn(req, res, next) { 
  const user_ID = req.cookies.user_ID;
   if (user_ID && users[user_ID]) {
    next();
   } else {
    res.status(401).send("You need to log in first");
   }
}

function checkUrlID (req, res, next) {

  // const urlID = req.params.id;

   const requestedURL = urlDatabase[req.params.id];

  if (requestedURL === undefined) {
    res.status(404).send("URL short ID is not existed");
  } else {
    next();
  }


  // if(!userURLs.hasOwnProperty(urlID)) {
  //   res.status(404).send("URL ID is not existed");
  // } else {
  //   next();
  // }
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