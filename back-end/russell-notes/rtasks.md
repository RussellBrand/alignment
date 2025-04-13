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
## [ ] simple
for each model make a route that will produce a simple HTML page for GET

/simple/{MODEL}/count 
/simple/{MODEL}/readAll
/simple/{MODEL}/readOne/{ID}
/simple/{MODEL}/readMany/?ids={ID},{ID},{ID}
