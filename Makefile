commit:
	git add .
	git commit -m "auto"



deno-main:
	deno --allow-read --allow-net main.ts

deno-view:
	open https://alignment.deno.dev

deno-deploy: 
	deployctl deploy --project=alignment  --save-config main.ts

deploy-dry-run:
	deployctl deploy --project=alignment --dry-run  main.ts

build:
	cd front-end && npm run build

kill3000:
	kill-by-port.sh 3000

backend:
	cd back-end/ && npm run dev

test-backend:
	cd back-end/ && npm run test
