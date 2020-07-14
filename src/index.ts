import App from './App.svelte';
import { Client, ThreadID } from '@textile/hub';
import { Database } from '@textile/threads-database';
import { Libp2pCryptoIdentity } from '@textile/threads-core';
import { debug } from 'svelte/internal';

const app = new App({
    target: document.body,
});

export default app;

const dummy = {
    $id: "https://example.com/dummy.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Dummy",
    type: "object",
    required: ["_id"],
    properties: {
        _id: {
            type: "string",
            description: "The instance's id.",
        },
        name: {
            type: "string",
            description: "name for displaying in views"
        }
    }
};
// Start test code
// Prepare HUB DB
async function demo() {
    var keyInfoAccountSecure = { key: 'birp3hxmqfsvhwzymwvazedusya', secret: "bs43xte7fgkglo4vqei6oxeguktk3ny7qwoech3q" };
    var keyInfoGroupSecure = { key: 'b252qixkcdci2hsroghdlmjeatu', secret: "bvc2zcgvn7pjjxzkezk4b2rvztguaxrgwis37ili" };
    var client = await Client.withKeyInfo(keyInfoAccountSecure);
    var threadId = ThreadID.fromRandom();

    await client.newDB(threadId);
    await client.newCollection(threadId, "dummy", dummy);
    await client.create(threadId, "dummy", [{ _id: null, name: "name0" }, { _id: null, name: "name1" }, { _id: null, name: "name2" }, { _id: null, name: "name3" }]);
    console.debug("HUB DB content", (await client.find(threadId, "dummy", {})).instancesList);

    //Create localDB from HubInvite
    var invite = await client.getDBInfo(threadId);
    var identity = await Libp2pCryptoIdentity.fromRandom();
    var localDb = await Database.withKeyInfo(keyInfoGroupSecure, (new Date()).toUTCString(), undefined, undefined);
    await localDb.startFromInfo(identity, invite);

    console.debug(localDb.collections.has("dummy") ? 'DUMMY COLLECTION SYNCED' : 'DUMMY COLLECTION NOT SYNCED');
    if (localDb.collections.has("dummy")) return; // all fine

    var collection = await localDb.newCollection("dummy2", dummy);
    await collection.insert(...[{ _id: '01ed151phv26t2k09prqag02n4', name: "localItem" }]);

    var fromLocal = await collection.findById('01ed151phv26t2k09prqag02n4');


    var fromRemote = await client.find(threadId, "dummy", {});

    console.log("expected:", { _id: '01ed151phv26t2k09prqag02n4', name: "localItem" });
    console.log("local", fromLocal);
    console.log("remote", fromRemote.instancesList.find(x => x._id == '01ed151phv26t2k09prqag02n4'));
}

demo();