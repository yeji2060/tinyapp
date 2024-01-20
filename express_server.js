const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
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
  const templateVars = { 
    urls: urlDatabase,
    users: users,
    user_ID: req.cookies["user_ID"]
 };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  
  const templateVars = {
    users: users,
    user_ID: req.cookies["user_ID"]
  }


  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  const newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;

  res.redirect("/urls");
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    users: users,
    user_ID: req.cookies["user_ID"]
  }
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {

  console.log(req.body); // Log the POST request body to the console

  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id/edit", (req,res) => {
  
  const templateVars = {
    urlDatabase: urlDatabase,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    newURL: req.params.newURL,
    users: users,
    user_ID: req.cookies["user_ID"]
  }
;

  res.render("urls_show", templateVars);
})


app.post("/urls/:id/edit", (req, res) => {

  const id = req.params.id;

  const newURL = req.body.newURL;

  if (urlDatabase[id]) {
    urlDatabase[id] = newURL;
    res.redirect('/urls');
  } else {
    res.status(404).send('URL not found');
  }
});

app.post("/urls/:id/delete", (req, res) => {
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
    user_ID: null
  }

  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  const userObj = getUserByEmail(req.body.email);

  if(getUserByEmail(req.body.email)){
    res.cookie("user_ID", userObj.id);
  } else {
    res.status(400).send('email is not corrects')
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

