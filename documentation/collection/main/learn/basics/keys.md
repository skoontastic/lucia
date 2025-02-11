---
_order: 1
title: "Keys"
---

Keys allow you to reference users using external data from a provider. It's defined using a provider id and a provider user id.

## Get user from keys

[`getKeyUser()`](/reference/api/server-api#getkeyuser) can be used to get the user of the key by the provider id and provider user id. This will throw an error if the key doesn't exist.

```ts
import { auth } from "./lucia.js";

try {
	const { key, user } = await auth.getKeyUser("github", githubUserId);
} catch {
	// invalid key
}
```

## Validate key password

You can validate a key password and get the user with [`validateKeyPassword()`](/reference/api/server-api#validatekeypassword). This method will only work with keys with a password.

```ts
import { auth } from "./lucia.js";

try {
	const key = await auth.validateKeyPassword("username", username, password);
} catch {
	// invalid key or password
}
```

> (warn) While the error will indicate if the key or password was invalid, **be ambiguous with the error message** (eg. "Incorrect username or password").

## Get key

You can get the key data using [`getKey()`](/reference/api/server-api#getkey).

```ts
import { auth } from "./lucia.js";

try {
	const key = await auth.getKey("github", githubUserId);
} catch {
	// invalid key
}
```

### Get all keys of a user

You can get all keys belonging to a user using [`getAllUserKeys()`](/reference/api/server-api#getalluserkeys).

```ts
try {
	const keys = await auth.getAllUserKeys(userId);
	const primaryKey = keys.find((key) => key.isPrimary);
} catch {
	// invalid user id
}
```

## Create new key

You can create a new key for a user using [`createKey()`](/reference/api/server-api#createkey). You can only create non-primary keys with this method.

```ts
try {
	const key = await auth.createKey(userId, {
		providerId: "github",
		providerUserId: githubUsername,
		password: null
	});
} catch {
	// invalid input
}
```

## Update key password

You can update the password of a key with [`updateKeyPassword()`](/reference/api/server-api#createkey). You can pass on `null` to remove the password.

```ts
try {
	const key = await auth.updateKeyPassword("username", username, newPassword);
} catch {
	// invalid key
}
```

## Delete key

You can delete a non-primary key with [`deleteKey()`](/reference/api/server-api#deletekey). You cannot delete primary keys. This method will succeed regardless of the validity of key.

```ts
try {
	const key = await auth.updateKeyPassword("username", username, newPassword);
} catch {
	// invalid key
}
```
