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

	
## [ ] schema

extend the `openQuestionSchema` to also have

* kind: "nominal" | "ordinal" | "reflex-nom" | "reflex-ord" 

* response: string[]

with constraints

* the list of responses must have at least two items

* the responses cannot be repeated within an area

* each of the responses must not have leading or trailing whitespace

* each of the reponses must be non-blank

update the tests, controllers, routes, etc.

rerun the tests


## [ ] samples

make a seven set sample of OpenQuestions as an array in json format in the file

back-end/samples/sample.open_questions.json

include ID's 

## test upload

Make a test that uploads

back-end/samples/sample_open_questions.json

to the `open_questions` collection and verifies that it was uploaded properly.

## tests

1. upload json test in its own file
2. make a csv version of the jason sample file
3. uplload csv test in its own file
4. make test for downloading the json file
5. implement code to pass the test
6. run the test to verify that it passed
7. make test for downloading the csv file
8. implement code to pass the test
9. run the test to verify that it passed

## clear mongodb
## [ ] see if the upload stuff actually does work
## [ ] all questions rather than just 3

## [ ] fix source tree
## [ ] other schema
answered_questions with the ONLY IF field for reflexive
## [ ] simple form verios of text
## [ ] upload csv error handling 
## [ ] upload json error handling 

make a testing file for uploading json open questions:


make a test data in a fie `errorful_open_questions.json`

for uploading json open questions that demonstrates the following cases

add a test that shows that a item without an ID loads successful

add a test that shows that a item without an ID loads successful


add a test that shows with a wrong kind cannot be added

add a test that shows with a missing kind cannot be added

add a test that shows with a responses field cannot be added

add a test that shows with a responses field containing no items cannot be added


add a test that shows with a responses field containing only one items cannot be added

add a test that shows with a responses field containing only two items cannot be added

add a test that shows with an extra field cannot be added

