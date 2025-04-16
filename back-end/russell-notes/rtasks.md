## [ ] strict
put strict on all the data definitions


## [Y] .env for deploy
deployctl deploy --project=<project-name> --env=KEY=value [--env=KEY2=value2 ...] main.ts
https://chatgpt.com/share/67f8c673-574c-800e-a62a-20da64e02757


## [Y] deploy which files
## [Y] supertest rather than superagent
## [ ] `delete_all`, `delete_many`, `get_many`, `count`

## [ ] update should check that the ID's match
## [ ] make the real backend object

## [ ] make custom routes
## [ ] upload questions 
## [ ] upload answer types

## [ ] count
add an API for models that counts the number of records
including testing in questions.test.ts
## [ ] simple reads
for each model make a route that will produce a simple HTML page for GET

simple/{MODEL}/count 

simple/{MODEL}/readAll

simple/{MODEL}/readOne/{ID}

simple/{MODEL}/readMany/?ids={ID},{ID},{ID}

make tests in a file simple.test.ts to test these routes


## [ ] simple -- no id's on lines, give a form
## [ ] simple -- move the "back" link to the top
## [ ] simple -- toc -- have per object counts
## [ ] 
## [ ] simple writes

put test for this in simple_writes.test.ts

for each model make a route that will produce a simple HTML form, that will submit to the appropriate API 

on success redirect to the appropriate 

simple/{MODEL}/

page

on failure give a clear error message and let the user try again.



* simple/{MODEL}/new 
produces a form 
calls create

* simple/{MODEL}/upload-csv
let user upload a csv file 
calls   createMany,

* simple/{MODEL}/upload-json
let user upload a json file 
calls   createMany,

* simple/{MODEL}/edit
produces a form 
calls update

* simple/{MODEL}/delete
calls deleteOne

* simple/{MODEL}/deleteAll
give the user a button
require confirmation
calls deleteOne



## [ ] are the upload files ending up in the DB
## [ ] real table definitions
## [ ] sit for test
## [ ] user password


## [ ] hash of full pathname
## [ ] 

## [ ] merge failed auth -> master



## [ ] make questions -> singular everywhere

## [Y] plural

make all modelnames, types and schemas singular

make all route and tablenames

start by updating the test files.

create `src/util/normalize_names.ts` for all conversion between  

- routines singular & plural
- modelnames and routes
etc

run all the tests to verify that the changes still work
x



## [ ] questions

I want to change

	`question` to `openQuestion` or `open_question`
	
everwhere as appropriate.

filename, modelnames, types, routes, schema, interfaces, tables, tests, etc.

Give me a list of things that should be changed

	
	
