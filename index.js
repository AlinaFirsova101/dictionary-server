const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const url = 'mongodb://mongo:27017';
const _ = require('lodash');
const path = require('path');
const fs = require('fs')

MongoClient.connect(url, function (err, client) {
	const db = client.db('terms');
	const collection = db.collection('terms');

	collection.drop()

	fs.readFile('./glossary.json', 'utf8', (err, json) => {
		const glossary = JSON.parse(json)
		collection.insertMany(glossary);
	})

	app.set('views', './views');
	app.set('view engine', 'pug');
	app.use(express.static('/'))
	app.use(bodyParser.urlencoded({ extended: true }));
	app.get('/', async function (req, res) {
		res.render('index', { title: 'Добро пожаловать!', message: 'Добавьте к URL понятие через слеш для получения определения' });
	});

	app.get('/mindmap', (req, res) => {
		res.sendFile(path.join(__dirname, 'mindmap.png'));
	})

	app.get('/style', (req, res) => {
		res.sendFile(path.join(__dirname, 'style.css'));
	})

	app.post('/addData', async (req, res) => {
		const { term, definition } = req.body;
		collection.insertOne({term: term, definition: definition});
		const data = await collection.find({}).toArray()
		fs.writeFileSync("./glossary.json", JSON.stringify(data),  "utf8")
		res.redirect(`/${term}`);
	})


	app.get('/:term', async function (req, res) {
		const [data] = await collection.find({ term: req.params.term }).toArray();

		if (!_.isEmpty(data)) {
			const { term, definition } = data;

			res.render('index', { title: term, message: definition });
		} else {
			res.sendFile(path.join(__dirname, 'input-form.html'));
		}
	});

	app.listen(9000)
})
