const express = require('express')
const bodyParser = require('body-parser')
const bcrypt  = require('bcrypt-nodejs')
const cors = require('cors')
const knex = require('knex')

const db = knex ({ 
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'hsin',
    password : '',
    database : 'smart-brain'
  }
});

console.log(db.select('*').from('users'))

const app = express()
//middleware to parse the body becasue express does not know what body is
app.use(bodyParser.json())
app.use(cors())

const database = {
	users:[
		{id:'123',
		 name:'hsin',
		 email:'shinhsu18@gmail.com',
		 age:38,
		 password:'cookie',
		 joined:new Date(),
		 entries:0
		},
		{id:'124',
		 name:'sally',
		 age:38,
		 password:'cookie',
		 email:'sally@gmail.com',
		 joined:new Date(),
		 entries:0
		},
	]
}

    login: [
    	{
			id:'123',
			hash:'',
			email:'shinhsu@gmail.com'
	}		
	]

app.get('/', (req, res) => {
	res.send(database.users)
})

app.post('/signin' , (req, res) => {
	db.select('email', 'hash').from('login')
	.where('email', '=', req.body.email)
	.then(data => {
     const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
	 if (isValid) {
	 	return db.select('*').from('users')
			.where('email', '=', req.body.email)
			.then(user => {
				res.json(user[0])				
			})
			.catch(err => res.status(400).json('unable to get user'))
	 } else {
	 	res.status(400).json('wrong credentials')
		}
	})
	.catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
	const { email, name, password, age } = req.body
	//create a "transaction" when you have to do two things at once
	//in here, we have to insert the hash and email into login table
	//then we insert the records into users table
	const hash = bcrypt.hashSync(password)
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
			.returning('*') //returns all columns
			.insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
			})
			.then(user => {
			res.json(user[0])
			})
	    })
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('unable to register!'))
})
/*
// Load hash from your password DB.
   bcrypt.compare("bacon", hash, function(err, res) {
    // res == true
   });
   bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
   });
*/


app.get('/profile/:id', (req, res) => {
	const { id } = req.params
	//let found = false
	db.select('*').from('users').where({id}) //same as {id:id}
	  .then(user => {
	  if (user.length) {
	  	res.json(user[0])
	  } else {
	  	res.status(400).json('Not found')
	  }
	})
	.catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {
	const { id } = req.body
	db('users').where('id','=',id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries =>{
		res.json(entries[0])
	})
	.catch(err => res.status(400).json('failed to add entries'))
})

app.listen(3000, () => {
	console.log('app is running on port 3000')
})


/*
/ --> this is working
/signin --> POST = sucess/fail
/register --> POST = user
/profile/:userid --> GET = user
/image --> PUT --> user
*/
