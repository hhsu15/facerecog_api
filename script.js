const express = require('express')
const bodyParser = require('body-parser')


const app = express()
//middleware to parse the body becasue express does not know what body is
app.use(bodyParser.json())

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


app.get('/', (req, res) => {
	res.send(database.users)
})
  
app.post('/signin' , (req, res) => {
	if (req.body.email === database.users[0].email &&
	    req.body.password === database.users[0].password) {
        res.json('success')
	} else {
    	res.status(400).json('error logining in')
	} 
})

app.post('/register', (req, res) => {
	const { email, name, password, age } = req.body
	console.log(email)
	database.users.push({
		id: 12,
		name: name,
		email: email,
	    password: password,
		age: age
	})
    res.json(database.users)
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params
	let found = false
	database.users.forEach(user => {
    	if (user.id === id) {
		found = true
		return res.json(user)
	    }
    })
	if (!found) {
		res.status(400).json('not found')
	}
})

app.put('/image', (req, res) => {
	const { id } = req.body
	let found = false
	database.users.forEach(user => {
    	if (user.id === id) {
		found = true
		user.entries++
		return res.json(user.entries)
	    }
	})
	if (!found) {
		res.status(400).json('not found')
	}
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
