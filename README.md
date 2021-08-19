# Clocktower Twitch Extension Backend
A backend for the clocktower twitch overlay extension

# Endpoints

## JWT AUTH
These endpoints are called by the Twitch extension, and require a signed JWT to function.

### GET /grimoire/
Loads the grimoire for a channelId based on JWT. Currently only capable of loading the broadcaster's view.

### GET /broadcaster/:channelId
Get a broadcaster's secret key. Used for config view only

### POST /broadcaster/
Update a broadcaster's secret key


## NO JWT AUTH
These endpoints are called by the bookmarklet on the Clocktower app, and only require the secret key.

### POST /grimoire/:secretKey
When a grimoire is received, we need to check the session,
see if anyone is currently streaming that session,
and publish updates to each of them.

### POST /session/:secretKey
Upsert a session record to assign a broadcaster to a specific session and player.
The `isActive` flag marks whether the session should be sent to the viewers (when false, overlay should show nothing).


