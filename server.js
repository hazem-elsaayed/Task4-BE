const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors')
const User = require('./UserSchema');

const app = express();
app.use(express.json());
app.use(cors())

//connecting to DB
mongoose
  .connect(
    'mongodb+srv://user:test1945@cluster0-306uy.mongodb.net/Task4?retryWrites=true&w=majority',
    { useUnifiedTopology: true, useNewUrlParser: true }
  )
  .then(() => console.log('Successfully connected to the database'))
  .catch((err) =>
    console.log('Could not connect to the database. Exiting now...', err)
  );

//register new user end point
app.post('/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;
  let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  let phoneformat = /^-{0,1}\d*\.{0,1}\d+$/;
  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !address ||
    !email.match(mailformat) ||
    !phone.match(phoneformat)
  ) {
    return res.status(400).json('Wrong Inputs');
  }
  let hashPass = bcrypt.hashSync(password);
  const user = new User({
    name: name,
    email: email,
    password: hashPass,
    phone: phone,
    address: address,
  });
  user
    .save()
    .then((user) =>
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        date: user.date,
      })
    )
    .catch((err) => res.status(400).json(err));
});

//signin endpoint
app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('Empty Inputs');
  }
  User.findOne({ email: email })
    .then((user) => {
      const validPass = bcrypt.compareSync(password, user.password);
      if (validPass) {
        return res.json({
          id: user._id,
          name: user.name,
          email: user.email,
          date: user.date,
        });
      } else {
        return res.status(400).json('Wrong Credentials');
      }
    })
    .catch((err) => res.status(400).json('Unable to get the user'));
});

let port = process.env.PORT || 5000;
app.listen(port, () => console.log(`App is working on port ${port}`));
