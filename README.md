# Message Bottles

## What's this website for?

Do you have the experience that you are in low mood, but you find it hard to tell it to your family or friends? Well, welcome to **Message Bottles**, a safe space for sharing your thoughts and emotions *anonymously*.

Here, you can freely express the feelings and struggles that are hard to voice elsewhere. Your words will drift like a message in a bottle, to be randomly discovered and responded to by others.

Together, let's support each other through life's ups and downs!

## Development

Our TODO List:

- [X] Fix "Get New Message" part, shouldn't display the message you sent
- [X] After send a message, switch to the page that displays the message you sent
- [X] Display response number in each message
- [] Add "how to use the website" in the documentation page
- [X] Modify CSS to make the website more beautiful
- [X] Clear debug messages in the console and from database
- [] Deploy using docker.
- [X] When there are no messages, display a page to tell that this is empty (not website error)
- [X] Support CSS for mobile devices

## Deployment

1. Set up two `env.js` files:

- first at `website-server/src/js/env.js`:
    
    ```js
    const BASE_URI = 'http://YOUR_SERVER_IP:3001/';
    export default BASE_URI;
    ```

- second at `db-server/env.js`:

    ```js
    const MY_ADDR = "http://YOUR_SERVER_IP:3000";
    const URI = "YOUR_MONGO_DB_CONNECTION_STRING"
    module.exports = { URI, MY_ADDR };
    ```

    you can find your connection string at [MongoDB Atlas](https://www.mongodb.com/docs/manual/reference/connection-string/#find-your-connection-string)

2. Then add the server IP to the white-list of the MongoDB. Please follow the instructions [here](https://www.mongodb.com/docs/atlas/cli/current/command/atlas-accessLists-create/).

3. Finally, run the following commands:

```sh
export version=YOUR_WANTED_VERSION
echo Using version $version && \
sudo docker pull hiddenhyperparameter/message-website-db:$version && \
sudo docker pull hiddenhyperparameter/message-website-webserver:$version && \
sudo docker tag hiddenhyperparameter/message-website-db:$version db:$version && \
sudo docker tag hiddenhyperparameter/message-website-webserver:$version web:$version && \
echo Successfully pulled the images
```

Then run on two separate terminals:

```sh
sudo docker run -p 3001:3001 --name db db:$version > db.log 2>&1 & tail -f db.log
```

```sh
sudo docker run -p 3000:3000 --name web web:$version > web.log 2>&1 & tail -f web.log
```

Notice that the first time you run on a new server, it is likely to fail since the MongoDB requires the IP in white-list. Please follow the instructions [here](https://www.mongodb.com/docs/atlas/cli/current/command/atlas-accessLists-create/) to add the IP of your server to the white-list.
