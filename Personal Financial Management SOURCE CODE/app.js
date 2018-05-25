var express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	LocalStrategy = require('passport-local'),
	passportLocalMongoose = require('passport-local-mongoose'),
	path = require('path')

var app = express();

var User = require("./models/user.js");
mongoose.connect("mongodb://localhost/Finance_System");

//Home.ejs
app.get("/homepage",function(req , res){
 res.sendFile(__dirname+'/views/index.html');
});

app.use(express.static(path.join(__dirname,'/views/img')));


//Configure Passport
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
	secret:"JS is the best server scripting",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Secret page (secret.ejs)
app.get("/secret",function(req , res){
res.render("secret.ejs");
});

//Sign Up (Register.ejs)
app.get("/register",function(req , res){
res.render("register.ejs");
});

app.post("/register",function(req , res){
	User.register(new User({username: req.body.username}),
	req.body.password, function(err,user){
		if(err){
			console.log(err);
		return res.render("/");}
		//logged the user in using passport
		passport.use(new LocalStrategy(User.authenticate()));
	});
});

//Login (login.ejs)
passport.use(new LocalStrategy(User.authenticate()));
passport.authenticate('local', { failureFlash: 'Invalid username or password.' });

app.get("/login",function(req , res){
res.render("login.ejs");
});

app.post("/login",passport.authenticate("local",{
	successRedirect: "/",
	failureRedirect: "/login",
	failureFlash: true
}) ,function(req,res){
});

//Logout 
app.get("/logout",function(req , res){
	req.logout();
	req.redirect("/");
});

//is Loggedin
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
	

//Home.ejs
var usernme = require('./models/user.js');
app.get("/",function(req , res){
res.render("home.ejs",{username:usernme.username});
});

var expensesSchema = new mongoose.Schema({
	user: String,
	category: String,
	description: String,
	amount: Number,
	date: Date	
});

var expense = mongoose.model("expense", expensesSchema);

app.post("/", (req, res) => {
  var myData = new expense(req.body);
  myData.save()
    .then(item => {
		res.render("home.ejs");
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
    });
});

//Finance Expenses List (fin_exp_display.ejs)
		app.get('/expense/:datess', function(req,res) {
			var datess = req.param("datess")
			expense.find({date:datess}, function(err, prds) {
			console.log("\nProducts !");
			console.log(prds); 
			renderResultExp(res, prds, "Product List from MongoDB :");
		});});

		function renderResultExp(res, prds, msg) {
		  res.render('fin_exp_display.ejs', {message:msg, products:prds},
			function(err, result) {
			  if (!err) {res.end(result);}
			  else {res.end('Oops ! An error occurred.');
				console.log(err);}
		});}

//Remove Data Expenses
	app.get('/remove_expenses/:Id', function(req,res) {
			var id = req.param("Id")
		
		expense.findById(id, function(err, expense){
			if(err) { return res.send(500, err); }

			expense.remove(function(err){
				if(err) { return res.send(500, err); }
				return res.render("home.ejs");
			});
		})
	});
		
		
//Finance Salary (fin_sal.ejs)
app.get("/financeSalary",function(req , res){
res.render("fin_sal.ejs");
});

var incomesSchema = new mongoose.Schema({
	description: String,
	amount: Number,
	year: String,
	month: String
});

var incomes = mongoose.model("incomes", incomesSchema);

	app.post("/financeSalary", (req, res) => {
	  var myDataSal = new incomes(req.body);
	  myDataSal.save()
		.then(item => {
			res.render("fin_sal.ejs");
		})
		.catch(err => {
		  res.status(400).send("unable to save to database");
		});
	});

//Finance Salary List (fin_sal_display.ejs)
		app.get('/income/:year', function(req,res) {
			var year = req.param("year")
			incomes.find({year:year}, function(err, prds) {
			console.log("\nProducts !");
			console.log(prds); 
			renderResult(res, prds, "Product List from MongoDB :");
		});});

		function renderResult(res, prds, msg) {
		  res.render('fin_sal_display.ejs', {message:msg, products:prds},
			function(err, result) {
			  if (!err) {res.end(result);}
			  else {res.end('Oops ! An error occurred.');
				console.log(err);}
		});}

//Remove Data Salary
	app.get('/remove_salary/:Id', function(req,res) {
			var id = req.param("Id")
		
		/*incomes.findById(id, function(err, expense){
			if(err) { return res.send(500, err); }

			incomes.remove(function(err){
				if(err) { return res.send(500, err); }
				return res.render("fin_sal.ejs");
			});
		})*/
		
		incomes.remove({_id: req.param('Id')}, function(err, post) {
			if (err) return res.send(err.message, 500); // server error
			res.render("fin_sal.ejs");
		})
	});		


app.listen(3000,function(){
	console.log('Server has started');
});

app.get("*",function(req, res){
	res.send("Page not found!");
});