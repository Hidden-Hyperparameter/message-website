build_db:
	sudo docker build -t db:latest -f ./db-server-docker/Dockerfile ..
#	sudo docker build -t db:latest -f ./db-server-docker/Dockerfile .. --network=host

build_web:
	sudo docker build -t web:latest -f ./website-server-docker/Dockerfile ..
#	sudo docker build -t web:latest -f ./web-server-docker/Dockerfile .. --network=host

build: build_db build_web

push:
# change version number here
	@export version=$(shell cat VERSION) && \
	echo Using version $$version && \
	sudo docker tag db:latest hiddenhyperparameter/message-website-db:$$version && \
	sudo docker tag web:latest hiddenhyperparameter/message-website-webserver:$$version && \
	sudo docker push hiddenhyperparameter/message-website-db:$$version && \
	sudo docker push hiddenhyperparameter/message-website-webserver:$$version

pull:
# change version number here
	@export version=$(shell cat VERSION) && \
	echo Using version $$version && \
	sudo docker pull hiddenhyperparameter/message-website-db:$$version && \
	sudo docker pull hiddenhyperparameter/message-website-webserver:$$version && \
	sudo docker tag hiddenhyperparameter/message-website-db:$$version db:latest && \
	sudo docker tag hiddenhyperparameter/message-website-webserver:$$version web:latest

run:
	sudo docker run -d -p 3001:3001 --name db db:latest
	sudo docker run -d -p 3000:3000 --name web web:latest

stop:
	sudo docker stop db
	sudo docker stop web
	sudo docker rm db
	sudo docker rm web